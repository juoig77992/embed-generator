// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.17.2
// source: users.sql

package postgres

import (
	"context"
	"database/sql"
)

const deleteUser = `-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1
`

func (q *Queries) DeleteUser(ctx context.Context, id string) error {
	_, err := q.db.ExecContext(ctx, deleteUser, id)
	return err
}

const getUser = `-- name: GetUser :one
SELECT id, name, discriminator, avatar, stripe_customer_id, stripe_email, is_tester FROM users WHERE id = $1
`

func (q *Queries) GetUser(ctx context.Context, id string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUser, id)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Discriminator,
		&i.Avatar,
		&i.StripeCustomerID,
		&i.StripeEmail,
		&i.IsTester,
	)
	return i, err
}

const getUserByStripeCustomerId = `-- name: GetUserByStripeCustomerId :one
SELECT id, name, discriminator, avatar, stripe_customer_id, stripe_email, is_tester FROM users WHERE stripe_customer_id = $1
`

func (q *Queries) GetUserByStripeCustomerId(ctx context.Context, stripeCustomerID sql.NullString) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserByStripeCustomerId, stripeCustomerID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Discriminator,
		&i.Avatar,
		&i.StripeCustomerID,
		&i.StripeEmail,
		&i.IsTester,
	)
	return i, err
}

const updateUserStripeCustomerId = `-- name: UpdateUserStripeCustomerId :one
UPDATE users SET stripe_customer_id = $2 WHERE id = $1 RETURNING id, name, discriminator, avatar, stripe_customer_id, stripe_email, is_tester
`

type UpdateUserStripeCustomerIdParams struct {
	ID               string
	StripeCustomerID sql.NullString
}

func (q *Queries) UpdateUserStripeCustomerId(ctx context.Context, arg UpdateUserStripeCustomerIdParams) (User, error) {
	row := q.db.QueryRowContext(ctx, updateUserStripeCustomerId, arg.ID, arg.StripeCustomerID)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Discriminator,
		&i.Avatar,
		&i.StripeCustomerID,
		&i.StripeEmail,
		&i.IsTester,
	)
	return i, err
}

const updateUserStripeEmail = `-- name: UpdateUserStripeEmail :one
UPDATE users SET stripe_email = $2 WHERE id = $1 RETURNING id, name, discriminator, avatar, stripe_customer_id, stripe_email, is_tester
`

type UpdateUserStripeEmailParams struct {
	ID          string
	StripeEmail sql.NullString
}

func (q *Queries) UpdateUserStripeEmail(ctx context.Context, arg UpdateUserStripeEmailParams) (User, error) {
	row := q.db.QueryRowContext(ctx, updateUserStripeEmail, arg.ID, arg.StripeEmail)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Discriminator,
		&i.Avatar,
		&i.StripeCustomerID,
		&i.StripeEmail,
		&i.IsTester,
	)
	return i, err
}

const upsertUser = `-- name: UpsertUser :one
INSERT INTO users (id, name, discriminator, avatar) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, discriminator = $3, avatar = $4 RETURNING id, name, discriminator, avatar, stripe_customer_id, stripe_email, is_tester
`

type UpsertUserParams struct {
	ID            string
	Name          string
	Discriminator string
	Avatar        sql.NullString
}

func (q *Queries) UpsertUser(ctx context.Context, arg UpsertUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx, upsertUser,
		arg.ID,
		arg.Name,
		arg.Discriminator,
		arg.Avatar,
	)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Discriminator,
		&i.Avatar,
		&i.StripeCustomerID,
		&i.StripeEmail,
		&i.IsTester,
	)
	return i, err
}
