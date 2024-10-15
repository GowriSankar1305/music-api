const jwt = require('jsonwebtoken');
const JWT_SECRET = '(Nycci9fSVO_]h>jpF!Nn~fy]16kZa24stTERI1~%j4.~6(9iV';

exports.validateToken = (req,res,next) => {
    console.log('---------------authntication the request------------')
    const authHeader =  req.get('Authorization');
    if(authHeader) { 
        const token = authHeader.split(' ')[1];
        if(null === token || !token)    {
            return res.status(401).json({'message':'Token is not present'});
        }
        else    {
            let decodedToken;
            try {
                decodedToken = jwt.verify(token,JWT_SECRET);
            }
            catch(err)  {
                return res.status(401).json({'message':'Your session expired. please login again!'});
            }
            req.currentId = decodedToken.principalId;
            next();
        }
    }
    else    {
        return res.status(401).json({'message':'Invalid request!'});
    }
};