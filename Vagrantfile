# -*- mode: ruby -*-

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "trusty64"
  config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"

  config.ssh.forward_agent = true
  config.ssh.insert_key = false

  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--memory", "1536"]
  end

  config.vm.define "dev", primary: true do |dev|
    dev.vm.network :private_network, ip: "192.168.50.10"
    dev.vm.network "forwarded_port", guest: 3030, host: 3030
    dev.vm.network "forwarded_port", guest: 9000, host: 9000
    dev.vm.network "forwarded_port", guest: 9010, host: 9010
  end

  config.push.define "atlas" do |push|
    push.app = "vladikoff/fxa-local-dev"
    push.dir = "."
  end
end
