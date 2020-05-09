/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var urlTemplate = _interopRequireDefault(require("url-template"));
var utils = require("aws-api-gateway-client/dist/lib/apiGatewayCore/utils").default;
var apiGatewayClientFactory = require("aws-api-gateway-client/dist/lib/apiGatewayCore/apiGatewayClient").default;

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {
    var apigClient = { };
    if(config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: '',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if(config.accessKey === undefined) {
        config.accessKey = '';
    }
    if(config.secretKey === undefined) {
        config.secretKey = '';
    }
    if(config.apiKey === undefined) {
        config.apiKey = '';
    }
    if(config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if(config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if(config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if(config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }

    
    // extract endpoint and path from url
    var invokeUrl = 'https://gf1tccyqza.execute-api.us-east-1.amazonaws.com/Dev';
    var endpoint = /(^https?:\/\/[^/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    
    
    
    apigClient.searchGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        utils.assertParametersDefined(params, ['q'], ['body']);
        
        var searchGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + urlTemplate('/search').expand(utils.parseParametersToObject(params, [])),
            headers: utils.parseParametersToObject(params, []),
            queryParams: utils.parseParametersToObject(params, ['q']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(searchGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.uploadPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        utils.assertParametersDefined(params, [], ['body']);
        
        var uploadPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + urlTemplate('/upload').expand(utils.parseParametersToObject(params, [])),
            headers: utils.parseParametersToObject(params, []),
            queryParams: utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(uploadPutRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.uploadBucketKeyPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        console.log(body)
        
        utils.assertParametersDefined(params, ['key', 'bucket'], ['body']);
        
        var uploadBucketKeyPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + urlTemplate('/upload/{bucket}/{key}').expand(utils.parseParametersToObject(params, ['key', 'bucket'])),
            headers: utils.parseParametersToObject(params, []),
            queryParams: utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(uploadBucketKeyPutRequest, authType, additionalParams, config.apiKey);
    };
    

    return apigClient;

};

var _default = apigClientFactory;
exports["default"] = _default;