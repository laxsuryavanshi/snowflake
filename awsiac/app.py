#!/usr/bin/env python3
import aws_cdk as cdk

from awsiac.snowflake_stack import SnowflakeStack

REGION = "ap-south-1"

env = cdk.Environment(region=REGION)
app = cdk.App()

SnowflakeStack(app, "SnowflakeStack", env=env)

app.synth()
