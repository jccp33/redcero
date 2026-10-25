import {createTeacherMailer} from './mail.js';
import {createTeacherSms} from './sms.js';
export function createTeacherNotifier(options={}) {
  const mail=createTeacherMailer(options),sms=createTeacherSms(options);
  return async(event,user)=>{
    const [emailResult,smsResult]=await Promise.all([mail(event,user),sms(event,user)]);
    console.info('Aviso docente:',event,'email='+emailResult.status,'sms='+smsResult.status);
    return {...emailResult,sms:smsResult};
  };
}
