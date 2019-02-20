const sendmail = require('sendmail')({
    logger: {
        debug: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error
    },
    devPort: 1025, // Default: False
    devHost: 'localhost', // Default: localhost
    smtpPort: 2525, // Default: 25
    smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
})
console.log("[mailer] mailer initialiser.")
sendmail.sendMail = function(from, to, object, text){
    sendmail({
        from: from,
        to: to,
        subject: object,
        html: text,
    }, function(err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
        return ;
    });
}


module.exports = sendmail;