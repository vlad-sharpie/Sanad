zip:
	cd sanad@apps.mirsobhan.ir && zip -r ../sanad@apps.mirsobhan.ir.zip ./*

format:
	prettier --write sanad@apps.mirsobhan.ir/extension.js --use-tabs
