DIST=dist/diya-sdk/usr/lib/diya-sdk

compile:
	npm run build

prepare-package:
	mkdir -p $(DIST)
	cp -R package.json $(DIST)/
	cp -R src $(DIST)/


# WARNING : this target is for development purposes only !
detach:
	@sudo diya-detach /usr/lib/diya-sdk


clean:
	rm -rf dist
	rm milestone
	rm Makefile
