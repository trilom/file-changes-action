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

clean:
	find ./lib/ ! -name .gitignore -type f -exec rm -rf {} + && \
	find ./dist/ ! -name .gitignore -type f -exec rm -rf {} + && \
	find ./node_modules/ ! -name .gitignore -type f -exec rm -rf {} +

run:
	docker run \
		-it \
		--mount type=bind,source="$(MKFILEPATH)",target=/code \
		$(DOCKER) \
		/bin/sh -c 'cd /code && make .yarn COMMAND=$(CMD)' && \
	if [ "$(CI)" = "TRUE" ]; then \
		rm -rf dist/.gitignore && rm -rf /tmp/node_modules/.gitignore; \
	fi

.yarn:
	yarn $(CMD)
