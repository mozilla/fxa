FROM amazonlinux:latest

RUN yum install -y gcc zlib zlib-devel openssl openssl-devel wget zip && \
    wget https://www.python.org/ftp/python/2.7.13/Python-2.7.13.tgz && \
    tar -xzvf Python-2.7.13.tgz && \
    cd Python-2.7.13 && ./configure && make && make install
RUN python -m ensurepip --upgrade

RUN mkdir /app
WORKDIR /app
COPY requirements.txt /app/
RUN pip install -r requirements.txt -t lambda_package
COPY amplitude.py /app/
RUN zip lambda *.py && \
    cd lambda_package && zip -r ../lambda.zip .
