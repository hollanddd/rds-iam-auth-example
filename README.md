# RDS Token Auth Example

![don't-use](https://img.shields.io/badge/-do%20not%20use-f40d12?logo=adblock&style=for-the-badge)
<br /><sup><sub>This project uses `cdk-nag` to discourage you from deploying.</sub></sup>

We're trying to avoid using passwords in out Postgres environments and needed to test some assumptions about the way RDS IAM token authentications works.

# Set Up

These instructions assume that the AWS CDK is already configured in your environment

```
git clone https://github.com/hollanddd/rds-iam-auth-example.git
cd rds-iam-auth-example
npm install
npx cdk synth
npx cdk deploy
```

### Grant RDS IAM

```sql
GRANT rds_iam ON username;
```

#### User Creation

This project creates a database user for us. To create additional users we can:

```sql
CREATE username WITH LOGIN;
```

### SSL Instructions should have been displayed

To connect you will need to configure ssl by following the instructions presented on screen.

```
export PGHOST=dbinstance.information
export PGSSLMODE=verify-full
export PGSSLROOTCA=absolute/path/to/cert
```

Retrieve tokens from IAM

```
export PGPASSWORD="$(aws rds generate-db-auth-token --profile admin --hostname $PGHOST --port 5432 --region region --username username)"
```

Connect using `psql`

```
psql -h $PGHOST -U username -d dbname
```

# Tear Down

```
cdk destroy
```

## Sources

- [RDS IAM Policy](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.IAMPolicy.html)
- [Create database with iam enabled](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.Enabling.html)
- [Using ssl with RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html)
- [Connect using psql](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.Connecting.AWSCLI.PostgreSQL.html)
