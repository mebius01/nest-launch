export const getAuthUserByEmailSql = `
select u.*, la.password_hash
from users u
left join local_auth la on u.user_id = la.user_id
where u.email = :email
`