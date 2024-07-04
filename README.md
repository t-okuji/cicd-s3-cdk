# CDK + CodeCommit + CodeBuild + CodePipeline

This is a project for uploading in S3.

## Diagrams

![AWS Diagrams](/drawio/cicd-s3-cdk.svg)

## Push codebuild custom image to ecr

```
docker build -t <custom-image-name> . --platform linux/amd64
docker tag <custom-image-name>:latest xxxxxxxxxxxx.dkr.ecr.<your region>.amazonaws.com/cicd-s3-ecr-repository:latest
docker push xxxxxxxxxxxx.dkr.ecr.<your region>.amazonaws.com/cicd-s3-ecr-repository:latest
```

## Run pipeline

Add buildspec.yml to your project and push to CodeCommit.
Refer to `buildspec_sample.yml`.

## Useful commands

* `bun run build`   compile typescript to js
* `bun run watch`   watch for changes and compile
* `bun run test`    perform the jest unit tests
* `bunx cdk deploy`  deploy this stack to your default AWS account/region
* `bunx cdk diff`    compare deployed stack with current state
* `bunx cdk synth`   emits the synthesized CloudFormation template