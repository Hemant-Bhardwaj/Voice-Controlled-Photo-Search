# import json

# def lambda_handler(event, context):
#     # TODO implement
#     print("The data has come here\n")
#     return {
#         'statusCode': 200,
#         'body': json.dumps('Hello from Lambda!')
#     }
import boto3
import os
import json
from datetime import datetime
import time
import urllib.parse
from requests_aws4auth import AWS4Auth
from elasticsearch import Elasticsearch, RequestsHttpConnection

def search_intent(keys):
    
    vpcEndPoint = 'vpc-photos-4kiie3w6likagxncic65ld3v7y.us-east-1.es.amazonaws.com'
    region = 'us-east-1'

    service = 'es'
    credentials = boto3.Session().get_credentials()

# awsauth = AWS4Auth("AKIAZRDXPGY5F3VT5ZHK", "IF6g7iqkItCLHNvT1KDrFSnBGG28RxPGRd9SPSeT", region, service)
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
# logger.debug(credentials.access_key)
# logger.debug(credentials.secret_key)

    es = Elasticsearch(
        hosts = [{'host': vpcEndPoint, 'port': 443}],
        http_auth = awsauth,
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
    )
    #es = Elasticsearch("https://vpc-photos-4kiie3w6likagxncic65ld3v7y.us-east-1.es.amazonaws.com")
    resp = []
    for key in keys:
        if (key is not None) and key != '':
            searchData = es.search(index="photos", body={
                                                   "query": {
                                                        "match": {
                                                            "labels": key
                                                        }}})
            resp.append(searchData)
    print(resp)
    output = []
    for r in resp:
        if 'hits' in r:
             for val in r['hits']['hits']:
                key = val['_source']['objectKey']
                if key not in output:
                    output.append('https://b2-photo-bucket.s3.amazonaws.com/'+key)
    print (output)
    return output    

def lambda_handler(event, context):
    # TODO implement
    print(event)
    # print(event)
    print("-------------")
    os.environ['TZ'] = 'America/New_York'
    #time.tzset()
    print (event)
    pictures = []
    client = boto3.client('lex-runtime')
    #logger.debug("In lambda")
    response_lex = client.post_text(
    botName='SearchItems',
    botAlias='$LATEST',
    userId='user',
    inputText= event['queryStringParameters']['q'])
    print(response_lex)
    if 'slots' in response_lex:
        keys = [response_lex['slots']['slotone'],response_lex['slots']['slottwo']]#,response_lex['slots']['keythree']
        
        print (keys)
        
        pictures = search_intent(keys)
    print (pictures)
    if not pictures:
        return{
            'statusCode':200,
            "headers": {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Credentials":True,"Content-Type":"application/json"},
            'body':'No Results'
        }
    else:    
        return{
            'statusCode': 200,
            'headers': {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Credentials":True,"Content-Type":"application/json"},
            'body': json.dumps(pictures),
            'isBase64Encoded': False
        }

