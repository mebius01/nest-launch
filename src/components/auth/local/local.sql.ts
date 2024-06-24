export const getAuthUserByEmailSql = `
select u.*, al.password_hash
from users u
left join auth_local al on u.user_id = al.user_id
where u.email = :email
`