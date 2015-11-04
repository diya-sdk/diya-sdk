NAME=$(shell cat bower.json | grep name | cut -d\" -f4)
MILESTONE=$(shell cat bower.json | grep version | cut -d\" -f4)
DESC=$(shell cat bower.json | grep description | cut -d\" -f4)


all: compile

pkg-milestone:
	@echo $(MILESTONE)

pkg-name:
	@echo $(NAME)

pkg-desc:
	@echo $(DESC)


compile:
	@sudo diya-attach /usr/lib/diya-components/$(NAME)

prepare-package:
	mkdir -p dist/$(NAME)/usr/
	mkdir -p dist/$(NAME)/usr/lib/
	mkdir -p dist/$(NAME)/usr/lib/diya-components/
	mkdir -p dist/$(NAME)/usr/lib/diya-components/$(NAME)
	mkdir -p dist/$(NAME)/usr/lib/diya-sdk/
	rsync -av --exclude='dist/' --exclude='bower_components' --exclude='.git' --exclude='Makefile' --exclude='milestone' ./ dist/$(NAME)/usr/lib/diya-components/$(NAME)
	cp -R src dist/$(NAME)/usr/lib/diya-sdk
	cp -R build dist/$(NAME)/usr/lib/diya-sdk


detach:
	@sudo diya-detach /usr/lib/diya-sdk
	@sudo diya-detach /usr/lib/diya-components/$(NAME) /usr/lib/diya-sdk

clean:
	rm -rf dist
	rm milestone
	rm Makefile
