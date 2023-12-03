const jwtValidator = function(event, _context, callback) {
  const token = event.authorizationToken;
  switch (token) {
    case 'allow':
      callback(null, generatePolicy('user', 'Allow', event.methodArn));
      break;
    case 'deny':
      callback(null, generatePolicy('user', 'Deny', event.methodArn));
      break;
    case 'unauthorized':
      callback('Unauthorized');   // Return a 401 Unauthorized response
      break;
    default:
      callback('Error: Invalid token'); // Return a 500 Invalid token response
  }
};

// Help function to generate an IAM policy
const generatePolicy = function(principalId, effect, resource) {
  const authResponse = {
    principalId,
    policyDocument: null,
    context: null,
  };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    };
  }

  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    'stringKey': 'stringval',
    'numberKey': 123,
    'booleanKey': true,
    'test-now': 'yes',
  };
  return authResponse;
}
export const main = jwtValidator;
