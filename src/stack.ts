import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export class RdsIamTokenAuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stack = Stack.of(this);

    const port = 5432;

    const vpc = Vpc.fromLookup(this, 'vpc', {
      isDefault: true,
    });

    const securityGroup = new SecurityGroup(this, 'only-my-cidr', {
      vpc,
      securityGroupName: 'OnlyMyCidrAllowed',
      allowAllOutbound: true,
    });

    // @note intentionally not providing an ingress rule
    // securityGroup.addIngressRule(
    //   Peer.ipv4('be.careful.here.fam/32'),
    //   Port.tcp(port)
    // );

    const databaseName = 'tempdb';
    const username = 'adminuser';

    const db = new DatabaseInstance(this, 'temp-db', {
      // @note if this is the first time deploying the user you will need to grant rds_iam before you can use generate-db-auth-token
      credentials: { username, secretName: 'pg/tmpdb/masterpassword' },
      vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      engine: DatabaseInstanceEngine.POSTGRES,
      port,
      databaseName,
      securityGroups: [securityGroup],
      backupRetention: Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.DESTROY,
      publiclyAccessible: true,
      iamAuthentication: true,
    });

    new CfnOutput(this, 'host', {
      value: `export PGHOST="${db.dbInstanceEndpointAddress}"`,
    });

    new CfnOutput(this, 'amazonrootca', {
      value: `curl -JL https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o ./global-bundle.crt`,
    });

    new CfnOutput(this, 'sslmode', {
      value: 'export PGSSLMODE=verify-full',
    });

    new CfnOutput(this, 'sslrootca', {
      value: 'export PGSSLROOTCERT=$(pwd)/global-bundle.crt',
    });

    new CfnOutput(this, 'password', {
      value: `export PGPASSWORD="$(aws rds generate-db-auth-token --hostname $PGHOST --port ${db.dbInstanceEndpointPort} --region ${stack.region} --username ${username})"`,
    });

    new CfnOutput(this, 'psql', {
      value: `psql -h $PGHOST -U ${username} -d ${databaseName}`,
    });
  }
}
