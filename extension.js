import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(metadata) {
        super._init(0.0, _('DNS Changer'));
        this._metadata = metadata

        // Create icon
        this._icon = new St.Icon({
            icon_name: 'network-workgroup-symbolic',
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        // Current DNS label
        this._currentDNSLabel = new PopupMenu.PopupMenuItem(
            _('Current DNS: Loading...'),
            { reactive: false }
        );
        this.menu.addMenuItem(this._currentDNSLabel);

        // Add separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // DNS preset menu items
        this._presetItems = {};
        this.DNS_PRESETS = this._loadDNSPresets()
        Object.keys(this.DNS_PRESETS).forEach(provider => {
            let item = new PopupMenu.PopupMenuItem(_(provider));
            item.connect('activate', () => this._changeDNS(provider));
            this._presetItems[provider] = item;
            this.menu.addMenuItem(item);
        });

        // Add separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Refresh current DNS on menu open
        this.menu.connect('open-state-changed', (menu, isOpen) => {
            if (isOpen) this._updateCurrentDNS();
        });

        // Initial DNS check
        this._updateCurrentDNS();
    }

    async _updateCurrentDNS() {
        try {
            // Get current DNS using nmcli or resolvectl
            let [success, stdout] = await this._executeCommand(
                'nmcli -t -f IP4.DNS dev show 2>/dev/null || resolvectl status 2>/dev/null'
            );

            if (success) {
                let currentDNS = this._parseDNSOutput(stdout.toString());
                this._currentDNSLabel.label.text = _('Current DNS: ') + 
                    (currentDNS.length > 0 ? currentDNS.join(', ') : _('System Default'));

                // Update active preset indicator
                this._updateActivePreset(currentDNS);
            } else {
                this._currentDNSLabel.label.text = _('Current DNS: Error');
            }
        } catch (e) {
            this._currentDNSLabel.label.text = _('Current DNS: Error');
            Main.notifyError(_('Failed to get current DNS'));
            logError(e);
        }
    }
    
    _loadDNSPresets() {
    try {
        // Get extension directory
        let extensionDir = this._metadata.dir.get_path();
        console.log(extensionDir)
        let csvFile = Gio.File.new_for_path(
            GLib.build_filenamev([extensionDir, 'sanad.ns.csv'])
        );

        if (!csvFile.query_exists(null)) {
            Main.notifyError(_('DNS preset file not found'));
            logError(new Error('sanad.ns.csv not found'));
            return {};
        }
        // Read CSV file
        let [success, contents] = csvFile.load_contents(null);
        if (!success) {
            Main.notifyError(_('Failed to read DNS preset file'));
            logError(new Error('Failed to read sanad.ns.csv'));
            return {};
        }

        // Parse CSV
        let dnsPresets = {};
        // Use TextDecoder to properly decode the byte array
        let decoder = new TextDecoder('utf-8');
        let contentString = decoder.decode(contents);
        let lines = contentString.trim().split('\n');
        
        // Read all lines and append to DNS_PRESETS
        lines.slice(1).forEach(line => {
            if (line.trim()) {
                let [provider, dns1, dns2] = line.split(',').map(item => item.trim());
                let dnsServers = [];
                if (dns1) dnsServers.push(dns1);
                if (dns2) dnsServers.push(dns2);
                
                // Validate DNS addresses (except for System preset)
                if (provider !== 'System') {
                    dnsServers = dnsServers.filter(dns => this._isValidIP(dns));
                }
                dnsPresets[provider] = dnsServers;
            }
        });

        if (Object.keys(dnsPresets).length === 0) {
            Main.notifyError(_('No valid DNS presets found in file'));
            logError(new Error('Empty or invalid sanad.ns.csv'));
        }

        return dnsPresets;
    } catch (e) {
        Main.notifyError(_('Error loading DNS presets'+e));
        logError(e);
        return {};
    }
}

    _parseDNSOutput(output) {
        // Parse DNS from nmcli or resolvectl output
        let dnsList = [];
        output.split('\n').forEach(line => {
            if (line.includes('DNS') && line.includes(':')) {
                let dns = line.split(':')[1]?.trim();
                if (dns && this._isValidIP(dns)) dnsList.push(dns);
            }
        });
        return dnsList;
    }

    async _changeDNS(provider) {
        try {
            let dnsServers = this.DNS_PRESETS[provider];
            
            // Use nmcli to set DNS (requires NetworkManager)
            let command = provider === 'System' 
                ? 'nmcli con mod "$(nmcli -t -f NAME con show --active | head -n1)" ipv4.dns "" && nmcli con up "$(nmcli -t -f NAME con show --active | head -n1)"'
                : `nmcli con mod "$(nmcli -t -f NAME con show --active | head -n1)" ipv4.dns "${dnsServers.join(' ')}" && nmcli con up "$(nmcli -t -f NAME con show --active | head -n1)"`;

            let [success] = await this._executeCommand(command);

            if (success) {
                Main.notify(_('DNS changed to ') + provider);
                this._updateCurrentDNS();
            } else {
                throw new Error('Command execution failed');
            }
        } catch (e) {
            Main.notifyError(_('Failed to change DNS'));
            logError(e);
        }
    }

    _showCustomDNSDialog() {
        // Implement custom DNS dialog using St.Entry and a dialog
        // This is a placeholder for the actual implementation
        Main.notify(_('Custom DNS dialog not implemented yet'));
    }

    _updateActivePreset(currentDNS) {
        Object.keys(this._presetItems).forEach(provider => {
            let item = this._presetItems[provider];
            let presetDNS = this.DNS_PRESETS[provider];
            
            // Check if current DNS matches preset
            let isActive = presetDNS.length === currentDNS.length &&
                presetDNS.every(dns => currentDNS.includes(dns));
            
            item.setOrnament(isActive ? 
                PopupMenu.Ornament.DOT : 
                PopupMenu.Ornament.NONE
            );
        });
    }

    _isValidIP(ip) {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return ipRegex.test(ip) && ip.split('.').every(num => 
            parseInt(num) >= 0 && parseInt(num) <= 255
        );
    }

    async _executeCommand(command) {
        try {
            let proc = Gio.Subprocess.new(
                ['/bin/sh', '-c', command],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            return new Promise((resolve, reject) => {
                proc.communicate_utf8_async(null, null, (proc, res) => {
                    try {
                        let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                        resolve([proc.get_successful(), stdout, stderr]);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        } catch (e) {
            return [false, '', e.toString()];
        }
    }
});

export default class DNSChangerExtension extends Extension {
    enable() {
        this._indicator = new Indicator(this.metadata);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
