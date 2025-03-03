import { z } from "zod";
import { getUniqueId } from "../util";

export const uniqueIdSchema = z.number();

export type UniqueId = z.infer<typeof uniqueIdSchema>;

export const embedFooterTextSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedFooterText = z.infer<typeof embedFooterTextSchema>;

export const embedFooterIconUrlSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedFooterIconUrl = z.infer<typeof embedFooterIconUrlSchema>;

export const embedFooterSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(
    z.object({
      text: embedFooterTextSchema,
      icon_url: embedFooterIconUrlSchema,
    })
  )
);

export type EmbedFooter = z.infer<typeof embedFooterSchema>;

export const embedImageUrlSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedImageUrl = z.infer<typeof embedImageUrlSchema>;

export const embedImageSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(
    z.object({
      url: embedImageUrlSchema,
    })
  )
);

export type EmbedImage = z.infer<typeof embedImageSchema>;

export const embedThumbnailUrlSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedThumbnailUrl = z.infer<typeof embedThumbnailUrlSchema>;

export const embedThumbnailSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(
    z.object({
      url: embedThumbnailUrlSchema,
    })
  )
);

export type EmbedThumbnail = z.infer<typeof embedThumbnailSchema>;

export const embedAuthorNameSchema = z.preprocess(
  (d) => d ?? undefined,
  z.string().default("")
);

export type EmbedAuthorName = z.infer<typeof embedAuthorNameSchema>;

export const embedAuthorUrlSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedAuthorUrl = z.infer<typeof embedAuthorUrlSchema>;

export const embedAuthorIconUrlSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedAuthorIconUrl = z.infer<typeof embedAuthorIconUrlSchema>;

export const embedAuthorSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(
    z.object({
      name: embedAuthorNameSchema,
      url: embedAuthorUrlSchema,
      icon_url: embedAuthorIconUrlSchema,
    })
  )
);

export type EmbedAuthor = z.infer<typeof embedAuthorSchema>;

export const embedFieldNameSchema = z.preprocess(
  (d) => d ?? undefined,
  z.string().default("")
);

export type EmbedFieldName = z.infer<typeof embedFieldNameSchema>;

export const embedFieldValueSchema = z.preprocess(
  (d) => d ?? undefined,
  z.string().default("")
);

export type EmbedFieldValue = z.infer<typeof embedFieldValueSchema>;

export const embedFieldInlineSchma = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.boolean())
);

export type EmbedFieldInline = z.infer<typeof embedFieldInlineSchma>;

export const embedFieldSchema = z.object({
  id: z.preprocess(
    (d) => d ?? undefined,
    uniqueIdSchema.default(() => getUniqueId())
  ),
  name: embedFieldNameSchema,
  value: embedFieldValueSchema,
  inline: embedFieldInlineSchma,
});

export type EmbedField = z.infer<typeof embedFieldSchema>;

export const embedtitleSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedTitle = z.infer<typeof embedtitleSchema>;

export const embedDescriptionSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedDescription = z.infer<typeof embedDescriptionSchema>;

export const embedUrlSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedUrl = z.infer<typeof embedUrlSchema>;

export const embedTimestampSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type EmbedTimestamp = z.infer<typeof embedTimestampSchema>;

export const embedColor = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.number())
);

export type EmbedColor = z.infer<typeof embedColor>;

export const embedSchema = z.object({
  id: z.preprocess(
    (d) => d ?? undefined,
    uniqueIdSchema.default(() => getUniqueId())
  ),
  title: embedtitleSchema,
  description: embedDescriptionSchema,
  url: embedUrlSchema,
  timestamp: embedTimestampSchema,
  color: embedColor,
  footer: embedFooterSchema,
  author: embedAuthorSchema,
  image: embedImageSchema,
  thumbnail: embedThumbnailSchema,
  fields: z.preprocess(
    (d) => d ?? undefined,
    z.array(embedFieldSchema).default([])
  ),
});

export type MessageEmbed = z.infer<typeof embedSchema>;

export const buttonStyleSchema = z
  .literal(1)
  .or(z.literal(2))
  .or(z.literal(3))
  .or(z.literal(4))
  .or(z.literal(5));

export type MessageComponentButtonStyle = z.infer<typeof buttonStyleSchema>;

export const buttonSchema = z
  .object({
    id: z.preprocess(
      (d) => d ?? undefined,
      uniqueIdSchema.default(() => getUniqueId())
    ),
    type: z.literal(2),
    style: z.literal(1).or(z.literal(2)).or(z.literal(3)).or(z.literal(4)),
    label: z.preprocess((d) => d ?? undefined, z.string().default("")),
    action_set_id: z.preprocess(
      (d) => d ?? undefined,
      z.string().default(() => getUniqueId().toString())
    ),
  })
  .or(
    z.object({
      id: uniqueIdSchema.default(() => getUniqueId()),
      type: z.literal(2),
      style: z.literal(5),
      label: z.preprocess((d) => d ?? undefined, z.string().default("")),
      url: z.preprocess((d) => d ?? undefined, z.string().default("")),
      action_set_id: z.string().default(() => getUniqueId().toString()),
    })
  );

export type MessageComponentButton = z.infer<typeof buttonSchema>;

export const selectMenuOptionSchema = z.object({
  id: z.preprocess(
    (d) => d ?? undefined,
    uniqueIdSchema.default(() => getUniqueId())
  ),
  label: z.preprocess((d) => d ?? undefined, z.string().default("")),
  action_set_id: z.preprocess(
    (d) => d ?? undefined,
    z.string().default(() => getUniqueId().toString())
  ),
});

export type MessageComponentSelectMenuOption = z.infer<
  typeof selectMenuOptionSchema
>;

export const selectMenuSchema = z.object({
  id: z.preprocess(
    (d) => d ?? undefined,
    uniqueIdSchema.default(() => getUniqueId())
  ),
  type: z.literal(3),
  placeholder: z.preprocess((d) => d ?? undefined, z.optional(z.string())),
  options: z.preprocess(
    (d) => d ?? undefined,
    z.array(selectMenuOptionSchema).default([])
  ),
});

export type MessageComponentSelectMenu = z.infer<typeof selectMenuSchema>;

export const actionRowSchema = z.object({
  id: z.preprocess(
    (d) => d ?? undefined,
    uniqueIdSchema.default(() => getUniqueId())
  ),
  type: z.preprocess((d) => d ?? undefined, z.literal(1).default(1)),
  components: z.preprocess(
    (d) => d ?? undefined,
    z.array(buttonSchema.or(selectMenuSchema)).default([])
  ),
});

export type MessageComponentActionRow = z.infer<typeof actionRowSchema>;

export const messageAction = z
  .object({
    type: z.literal(1), // text response
    id: uniqueIdSchema.default(() => getUniqueId()),
    text: z.preprocess((d) => d ?? undefined, z.string().default("")),
  })
  .or(
    z.object({
      type: z.literal(2).or(z.literal(3)).or(z.literal(4)), // toggle, add, remove role
      id: uniqueIdSchema.default(() => getUniqueId()),
      target_id: z.string(),
    })
  );

export type MessageAction = z.infer<typeof messageAction>;

export const messageActionSet = z.object({
  actions: z.array(messageAction),
});

export type MessageActionSet = z.infer<typeof messageActionSet>;

export const messageContentSchema = z.preprocess(
  (d) => d ?? undefined,
  z.string().default("")
);

export type MessageContent = z.infer<typeof messageContentSchema>;

export const webhookUsernameSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type WebhookUsername = z.infer<typeof webhookUsernameSchema>;

export const webhookAvatarUrlSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(z.string())
);

export type WebhookAvatarUrl = z.infer<typeof webhookAvatarUrlSchema>;

export const messageTtsSchema = z.preprocess(
  (d) => d ?? undefined,
  z.boolean().default(false)
);

export type MessageTts = z.infer<typeof messageTtsSchema>;

export const messageAllowedMentionsSchema = z.preprocess(
  (d) => d ?? undefined,
  z.optional(
    z.object({
      parse: z.array(
        z.literal("users").or(z.literal("roles")).or(z.literal("everyone"))
      ),
      roles: z.array(z.string()),
      users: z.array(z.string()),
      replied_user: z.boolean(),
    })
  )
);

export const messageThreadName = z.optional(z.string());

export const messageSchema = z.object({
  content: z.preprocess(
    (d) => d ?? undefined,
    messageContentSchema.default("")
  ),
  username: webhookUsernameSchema,
  avatar_url: webhookAvatarUrlSchema,
  tts: messageTtsSchema,
  embeds: z.preprocess((d) => d ?? undefined, z.array(embedSchema).default([])),
  allowed_mentions: messageAllowedMentionsSchema,
  components: z.preprocess(
    (d) => d ?? undefined,
    z.array(actionRowSchema).default([])
  ),
  thread_name: messageThreadName,
  actions: z.preprocess(
    (d) => d ?? undefined,
    z.record(z.string(), messageActionSet).default({})
  ),
});

export type Message = z.infer<typeof messageSchema>;

export function parseMessageWithAction(raw: any) {
  const parsedData = messageSchema.parse(raw);

  // create messing action sets
  for (const row of parsedData.components) {
    for (const comp of row.components) {
      if (comp.type === 2) {
        if (!parsedData.actions[comp.action_set_id]) {
          parsedData.actions[comp.action_set_id] = {
            actions: [],
          };
        }
      } else {
        for (const option of comp.options) {
          if (!parsedData.actions[option.action_set_id]) {
            parsedData.actions[option.action_set_id] = {
              actions: [],
            };
          }
        }
      }
    }
  }

  return parsedData;
}
