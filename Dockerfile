FROM public.ecr.aws/ubuntu/ubuntu:22.04_stable AS builder
RUN apt update && apt install curl unzip -y
RUN curl -fsSL https://bun.sh/install | bash
RUN cp /root/.bun/bin/* /usr/local/bin
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

FROM public.ecr.aws/ubuntu/ubuntu:22.04_stable
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /usr/local/aws-cli /usr/local/aws-cli
RUN bun -v
