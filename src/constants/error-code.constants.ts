export enum ErrorCode {
  // Common Validation
  V000 = 'common.validation.error',
  V001 = 'common.error.many_request',

  //USER
  USER_V001 = 'user.validation.is_empty',
  USER_V002 = 'user.validation.is_invalid',
  USER_E001 = 'user.error.username_or_email_exists',
  USER_E002 = 'user.error.not_found',
  USER_E003 = 'user.error.email_exists',
  USER_E004 = 'user.error.invalid_token',


  //ACCOUNT
  ACC_E001 = 'account.error.exists',
  ACC_E002 = 'account.error.not_provider_id',
  ACC_E003 = 'account.error.login_fail',
  ACC_E004 = 'account.error.login_fail',

  //RELATION
  RELATION_E001 = 'relation.error.exists',
  RELATION_E002 = 'relation.error.not_exists',
  RELATION_E003 = 'relation.error.not_handle',

}