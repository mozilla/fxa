SYSTEMPYTHON = `which python2 python | head -n 1`
VIRTUALENV = virtualenv --python=$(SYSTEMPYTHON)
ENV = ./build
PIP_INSTALL = $(ENV)/bin/pip install
DEPS = $(ENV)/.done

.PHONY: test

test: $(DEPS)
	./test.sh

$(DEPS):
	$(VIRTUALENV) --no-site-packages $(ENV)
	$(PIP_INSTALL) -r requirements.txt
	touch $(DEPS)

