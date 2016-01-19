# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'yaml'

VAGRANTFILE_API_VERSION = "2"
localConfigPath = "local_config.yaml"

if File.exists?localConfigPath then
  settings = YAML::load(File.read(localConfigPath))
else
  settings = Hash.new
end

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.ssh.forward_agent = true
  config.ssh.insert_key = false

  config.vm.provider "virtualbox" do |vb|
    vb.memory = settings["memory"] ||= "2048"
    vb.cpus = 2
  end

  config.vm.define "dev", primary: true do |dev|
    dev.vm.network "private_network", ip: settings["ip"] ||= "192.168.50.10"
    dev.vm.network "forwarded_port", guest: 1111, host: 1111
    dev.vm.network "forwarded_port", guest: 1112, host: 1112
    dev.vm.network "forwarded_port", guest: 1113, host: 1113
    dev.vm.network "forwarded_port", guest: 1114, host: 1114
    dev.vm.network "forwarded_port", guest: 3030, host: 3030
    dev.vm.network "forwarded_port", guest: 5000, host: 5000
    dev.vm.network "forwarded_port", guest: 5050, host: 5050
    dev.vm.network "forwarded_port", guest: 8080, host: 8080
    dev.vm.network "forwarded_port", guest: 9000, host: 9000
    dev.vm.network "forwarded_port", guest: 9010, host: 9010
    dev.vm.network "forwarded_port", guest: 9011, host: 9011
    dev.vm.network "forwarded_port", guest: 10137, host: 10137
    dev.vm.network "forwarded_port", guest: 10139, host: 10139
    dev.vm.network "forwarded_port", guest: 10140, host: 10140
  end

  config.vm.provision "shell", privileged: false, path: "_scripts/vagrant_provision.sh", args: Vagrant::Util::Platform.windows?.to_s.upcase

  if settings.has_key?("push.app") then
    config.push.define "atlas" do |push|
      push.app = settings["push.app"]
      push.dir = settings["push.dir"] ||= "."
    end
  end
end
