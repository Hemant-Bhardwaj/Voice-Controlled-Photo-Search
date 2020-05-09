import json
import logging
import boto3
import os
from datetime import datetime
import time
import urllib.parse
from requests_aws4auth import AWS4Auth
from elasticsearch import Elasticsearch, RequestsHttpConnection

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

rekognition = boto3.client('rekognition')

vpcEndPoint = 'vpc-photos-4kiie3w6likagxncic65ld3v7y.us-east-1.es.amazonaws.com'
region = 'us-east-1'

service = 'es'
credentials = boto3.Session().get_credentials()

awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

es = Elasticsearch(
    hosts = [{'host': vpcEndPoint, 'port': 443}],
    http_auth = awsauth,
    use_ssl = True,
    verify_certs = True,
    connection_class = RequestsHttpConnection
    )


def lambda_handler(event, context):
    os.environ['TZ'] = 'America/New_York'
    time.tzset()
    
    logger.debug(credentials)
    records = event['Records']
    
    for record in records:
        s3Object = record['s3']
        bucket = s3Object['bucket']['name']
        objectKey = urllib.parse.unquote_plus(s3Object['object']['key'])
        
        image = {
            'S3Object': {
                'Bucket': bucket,
                'Name': objectKey
            }
        }
        
        response = rekognition.detect_labels(Image=image)
        
        labels = list(map(lambda x:x['Name'],response['Labels']))
        
    
        timestamp = datetime.now().strftime('%Y-%d-%mT%H:%M:%S')
        esObject = json.dumps({
            'objectKey' : objectKey,
            'bucket' : bucket,
            'createdTimestamp' : timestamp,
            'labels' : labels
        })
        
        es.index(index="photos", doc_type="Photo", id=objectKey, body=esObject, refresh=True)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Success!')
    }

