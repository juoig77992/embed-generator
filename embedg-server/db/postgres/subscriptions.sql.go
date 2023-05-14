// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.17.2
// source: subscriptions.sql

package postgres

import (
	"context"
	"time"

	"github.com/lib/pq"
)

const getActiveSubscriptionForGuild = `-- name: GetActiveSubscriptionForGuild :one
SELECT id, user_id, guild_id, stripe_customer_id, updated_at, status, price_ids FROM subscriptions WHERE guild_id = $1 AND $2::TEXT = ANY(price_ids) AND (status = 'active' OR status = 'trialing')
`

type GetActiveSubscriptionForGuildParams struct {
	GuildID string
	Column2 string
}

func (q *Queries) GetActiveSubscriptionForGuild(ctx context.Context, arg GetActiveSubscriptionForGuildParams) (Subscription, error) {
	row := q.db.QueryRowContext(ctx, getActiveSubscriptionForGuild, arg.GuildID, arg.Column2)
	var i Subscription
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.GuildID,
		&i.StripeCustomerID,
		&i.UpdatedAt,
		&i.Status,
		pq.Array(&i.PriceIds),
	)
	return i, err
}

const getStripeCustomerIdForGuild = `-- name: GetStripeCustomerIdForGuild :one
SELECT stripe_customer_id FROM subscriptions WHERE guild_id = $1
`

func (q *Queries) GetStripeCustomerIdForGuild(ctx context.Context, guildID string) (string, error) {
	row := q.db.QueryRowContext(ctx, getStripeCustomerIdForGuild, guildID)
	var stripe_customer_id string
	err := row.Scan(&stripe_customer_id)
	return stripe_customer_id, err
}

const getSubscriptionsForGuild = `-- name: GetSubscriptionsForGuild :many
SELECT id, user_id, guild_id, stripe_customer_id, updated_at, status, price_ids FROM subscriptions WHERE guild_id = $1
`

func (q *Queries) GetSubscriptionsForGuild(ctx context.Context, guildID string) ([]Subscription, error) {
	rows, err := q.db.QueryContext(ctx, getSubscriptionsForGuild, guildID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Subscription
	for rows.Next() {
		var i Subscription
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.GuildID,
			&i.StripeCustomerID,
			&i.UpdatedAt,
			&i.Status,
			pq.Array(&i.PriceIds),
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getSubscriptionsForUser = `-- name: GetSubscriptionsForUser :many
SELECT id, user_id, guild_id, stripe_customer_id, updated_at, status, price_ids FROM subscriptions WHERE user_id = $1
`

func (q *Queries) GetSubscriptionsForUser(ctx context.Context, userID string) ([]Subscription, error) {
	rows, err := q.db.QueryContext(ctx, getSubscriptionsForUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Subscription
	for rows.Next() {
		var i Subscription
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.GuildID,
			&i.StripeCustomerID,
			&i.UpdatedAt,
			&i.Status,
			pq.Array(&i.PriceIds),
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const upsertSubscription = `-- name: UpsertSubscription :one
INSERT INTO subscriptions (id, user_id, guild_id, stripe_customer_id, status, price_ids, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET status = $5, price_ids = $6, updated_at = $7 RETURNING id, user_id, guild_id, stripe_customer_id, updated_at, status, price_ids
`

type UpsertSubscriptionParams struct {
	ID               string
	UserID           string
	GuildID          string
	StripeCustomerID string
	Status           string
	PriceIds         []string
	UpdatedAt        time.Time
}

func (q *Queries) UpsertSubscription(ctx context.Context, arg UpsertSubscriptionParams) (Subscription, error) {
	row := q.db.QueryRowContext(ctx, upsertSubscription,
		arg.ID,
		arg.UserID,
		arg.GuildID,
		arg.StripeCustomerID,
		arg.Status,
		pq.Array(arg.PriceIds),
		arg.UpdatedAt,
	)
	var i Subscription
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.GuildID,
		&i.StripeCustomerID,
		&i.UpdatedAt,
		&i.Status,
		pq.Array(&i.PriceIds),
	)
	return i, err
}
