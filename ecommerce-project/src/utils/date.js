//import { format } from 'date-fns';


export function optionFirstDate(){
  const today = new Date() ;
  const optionFirst = today.setDate(today.getDate()+10)
  return optionFirst;
}

export function optionSecondDate(){
  const today = new Date();
  const optionSecond = (today.setDate(today.getDate()+4))
  return optionSecond;
}

export function optionThirdDate(){
  const today = new Date();
  const optionThird = (today.setDate(today.getDate()+1))
  return optionThird;
}

