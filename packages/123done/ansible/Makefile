build:
	@echo ${stack} ${key}
	PYTHONUNBUFFERED=1 ansible-playbook playbooks/app.yml \
    -e "stack_name=${stack}" -e "keyname=${key}" \
    -e "trusted_client_id=${trusted_client_id}" -e "trusted_client_secret=${trusted_client_secret}" \
    -e "untrusted_client_id=${untrusted_client_id}" -e "untrusted_client_secret=${untrusted_client_secret}"
