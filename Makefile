SHELL:=/bin/bash
MKFILEPATH:=$(shell pwd)
DOCKER:=node:12@sha256:454651174f54836571258a329788574cf6552bddfd1a7113e769bd9fc3776fe6
ifdef COMMAND
CMD:=$(COMMAND)
endif
ifndef COMMAND
CMD:=build
endif
ifdef RELEASE
CI:=TRUE
endif

IGNORE:=printf '%s\n%s' '**/*' '!.gitignore'

clean.files:
	rm -rf lib dist node_modules

clean.create:
	mkdir lib dist node_modules && \
	$(IGNORE) > lib/.gitignore && \
	$(IGNORE) > dist/.gitignore && \
	$(IGNORE) > node_modules/.gitignore

clean: clean.files clean.create

run:
	docker run \
		--mount type=bind,source="$(MKFILEPATH)",target=/code \
		$(DOCKER) \
		/bin/sh -c 'cd /code && make .yarn COMMAND=$(CMD)' && \
	if [ "$(CI)" = "TRUE" ]; then \
		rm -rf dist/.gitignore && rm -rf /tmp/node_modules/.gitignore; \
	fi

.yarn:
	yarn $(CMD)
