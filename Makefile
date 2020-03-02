SHELL:=/bin/bash
MKFILEPATH:=$(shell pwd)
DOCKER:=node:12@sha256:454651174f54836571258a329788574cf6552bddfd1a7113e769bd9fc3776fe6
ifdef COMMAND
CMD:=$(COMMAND)
endif
ifndef COMMAND
CMD:=build
endif

clean: 
	rm -rf lib node_modules

run:
	docker run \
		--mount type=bind,source="$(MKFILEPATH)",target=/code \
		$(DOCKER) \
		/bin/sh -c 'cd /code && make .yarn COMMAND=$(CMD)'

.yarn:
	yarn $(CMD)
