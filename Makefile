NAME=$(shell cat bower.json | grep name | cut -d\" -f4)
MILESTONE=$(shell cat bower.json | grep version | cut -d\" -f4)
DESC=$(shell cat bower.json | grep description | cut -d\" -f4)

pkg-milestone:
	@echo $(MILESTONE)

pkg-name:
	@echo $(NAME)

pkg-desc:
	@echo $(DESC)

compile:

prepare-package:
	mkdir -p dist/$(NAME)/usr/	
	mkdir -p dist/$(NAME)/usr/lib/	
	mkdir -p dist/$(NAME)/usr/lib/diya-components/	
	mkdir -p dist/$(NAME)/usr/lib/diya-components/$(NAME)	
	rsync -av --exclude='dist/' --exclude='bower_components' --exclude='.git' --exclude='Makefile' --exclude='milestone' ./ dist/$(NAME)/usr/lib/diya-components/$(NAME)


clean:
	rm -rf dist
	rm milestone
	rm Makefile

