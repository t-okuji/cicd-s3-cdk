import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as dotenv from "dotenv";

dotenv.config();

export class CicdS3CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const resourceName = "cicd-s3";

    // CodeCommit repository
    const codeRepository = new codecommit.Repository(this, "CodeRepository", {
      repositoryName: `${resourceName}-code-repository`,
    });

    // Ecr repository for codebuild custom image
    const ecrRepository = new ecr.Repository(this, "EcrRepository", {
      repositoryName: `${resourceName}-ecr-repository`,
    });

    // CodeBuild
    const buildProject = new codebuild.PipelineProject(this, `BuildProject`, {
      projectName: `${resourceName}-code-build`,
      buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
      environment: {
        buildImage: codebuild.LinuxBuildImage.fromEcrRepository(ecrRepository),
        computeType: codebuild.ComputeType.SMALL,
      },
      environmentVariables: {
        S3_BUCKET_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: process.env.S3_BUCKET_NAME ?? "",
        },
      },
    });

    // CodeBuild role
    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [
          `arn:aws:s3:::${process.env.S3_BUCKET_NAME ?? ""}`,
          `arn:aws:s3:::${process.env.S3_BUCKET_NAME ?? ""}/*`,
        ],
        actions: [
          "s3:DeleteObject",
          "s3:GetBucketLocation",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:PutObject",
        ],
      })
    );

    // Artifact
    const sourceOutput = new codepipeline.Artifact(`source_artifact`);
    const buildOutput = new codepipeline.Artifact(`build_output`);

    // CodePipeline Actions
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: "CodeCommit",
      repository: codeRepository,
      branch: "main",
      output: sourceOutput,
    });
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "CodeBuild",
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    // CodePipeline
    new codepipeline.Pipeline(this, "CodePipeline", {
      pipelineName: `${resourceName}-code-pipeline`,
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
      ],
    });
  }
}
