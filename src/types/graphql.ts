export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  bigint: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  numeric: { input: any; output: any; }
  timestamp: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
  uuid: { input: any; output: any; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bigint']['input']>;
  _gt?: InputMaybe<Scalars['bigint']['input']>;
  _gte?: InputMaybe<Scalars['bigint']['input']>;
  _in?: InputMaybe<Array<Scalars['bigint']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['bigint']['input']>;
  _lte?: InputMaybe<Scalars['bigint']['input']>;
  _neq?: InputMaybe<Scalars['bigint']['input']>;
  _nin?: InputMaybe<Array<Scalars['bigint']['input']>>;
};

/** Coze对话上下文管理表 */
export type Conversations = {
  __typename?: 'conversations';
  /** Coze API返回的conversation ID */
  coze_conversation_id: Scalars['String']['output'];
  /** 创建时间 */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 过期时间（7天后，不主动检查） */
  expires_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 主键UUID */
  id: Scalars['uuid']['output'];
  /** 最后一条消息时间 */
  last_message_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 消息计数 */
  message_count?: Maybe<Scalars['Int']['output']>;
  /** 参与对话的鱼ID数组 */
  participant_fish_ids: Array<Scalars['uuid']['output']>;
  /** 状态：active-活跃, expired-已过期 */
  status?: Maybe<Scalars['String']['output']>;
  /** 对话主题 */
  topic?: Maybe<Scalars['String']['output']>;
  /** 最后更新时间 */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 发起对话的用户ID */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "conversations" */
export type Conversations_Aggregate = {
  __typename?: 'conversations_aggregate';
  aggregate?: Maybe<Conversations_Aggregate_Fields>;
  nodes: Array<Conversations>;
};

/** aggregate fields of "conversations" */
export type Conversations_Aggregate_Fields = {
  __typename?: 'conversations_aggregate_fields';
  avg?: Maybe<Conversations_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Conversations_Max_Fields>;
  min?: Maybe<Conversations_Min_Fields>;
  stddev?: Maybe<Conversations_Stddev_Fields>;
  stddev_pop?: Maybe<Conversations_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Conversations_Stddev_Samp_Fields>;
  sum?: Maybe<Conversations_Sum_Fields>;
  var_pop?: Maybe<Conversations_Var_Pop_Fields>;
  var_samp?: Maybe<Conversations_Var_Samp_Fields>;
  variance?: Maybe<Conversations_Variance_Fields>;
};


/** aggregate fields of "conversations" */
export type Conversations_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Conversations_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Conversations_Avg_Fields = {
  __typename?: 'conversations_avg_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "conversations". All fields are combined with a logical 'AND'. */
export type Conversations_Bool_Exp = {
  _and?: InputMaybe<Array<Conversations_Bool_Exp>>;
  _not?: InputMaybe<Conversations_Bool_Exp>;
  _or?: InputMaybe<Array<Conversations_Bool_Exp>>;
  coze_conversation_id?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  expires_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  last_message_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  message_count?: InputMaybe<Int_Comparison_Exp>;
  participant_fish_ids?: InputMaybe<Uuid_Array_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  topic?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "conversations" */
export enum Conversations_Constraint {
  /** unique or primary key constraint on columns "coze_conversation_id" */
  ConversationsCozeConversationIdKey = 'conversations_coze_conversation_id_key',
  /** unique or primary key constraint on columns "id" */
  ConversationsPkey = 'conversations_pkey'
}

/** input type for incrementing numeric columns in table "conversations" */
export type Conversations_Inc_Input = {
  /** 消息计数 */
  message_count?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "conversations" */
export type Conversations_Insert_Input = {
  /** Coze API返回的conversation ID */
  coze_conversation_id?: InputMaybe<Scalars['String']['input']>;
  /** 创建时间 */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 过期时间（7天后，不主动检查） */
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 主键UUID */
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 最后一条消息时间 */
  last_message_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 消息计数 */
  message_count?: InputMaybe<Scalars['Int']['input']>;
  /** 参与对话的鱼ID数组 */
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  /** 状态：active-活跃, expired-已过期 */
  status?: InputMaybe<Scalars['String']['input']>;
  /** 对话主题 */
  topic?: InputMaybe<Scalars['String']['input']>;
  /** 最后更新时间 */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 发起对话的用户ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Conversations_Max_Fields = {
  __typename?: 'conversations_max_fields';
  /** Coze API返回的conversation ID */
  coze_conversation_id?: Maybe<Scalars['String']['output']>;
  /** 创建时间 */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 过期时间（7天后，不主动检查） */
  expires_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 主键UUID */
  id?: Maybe<Scalars['uuid']['output']>;
  /** 最后一条消息时间 */
  last_message_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 消息计数 */
  message_count?: Maybe<Scalars['Int']['output']>;
  /** 参与对话的鱼ID数组 */
  participant_fish_ids?: Maybe<Array<Scalars['uuid']['output']>>;
  /** 状态：active-活跃, expired-已过期 */
  status?: Maybe<Scalars['String']['output']>;
  /** 对话主题 */
  topic?: Maybe<Scalars['String']['output']>;
  /** 最后更新时间 */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 发起对话的用户ID */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Conversations_Min_Fields = {
  __typename?: 'conversations_min_fields';
  /** Coze API返回的conversation ID */
  coze_conversation_id?: Maybe<Scalars['String']['output']>;
  /** 创建时间 */
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 过期时间（7天后，不主动检查） */
  expires_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 主键UUID */
  id?: Maybe<Scalars['uuid']['output']>;
  /** 最后一条消息时间 */
  last_message_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 消息计数 */
  message_count?: Maybe<Scalars['Int']['output']>;
  /** 参与对话的鱼ID数组 */
  participant_fish_ids?: Maybe<Array<Scalars['uuid']['output']>>;
  /** 状态：active-活跃, expired-已过期 */
  status?: Maybe<Scalars['String']['output']>;
  /** 对话主题 */
  topic?: Maybe<Scalars['String']['output']>;
  /** 最后更新时间 */
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 发起对话的用户ID */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "conversations" */
export type Conversations_Mutation_Response = {
  __typename?: 'conversations_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Conversations>;
};

/** on_conflict condition type for table "conversations" */
export type Conversations_On_Conflict = {
  constraint: Conversations_Constraint;
  update_columns?: Array<Conversations_Update_Column>;
  where?: InputMaybe<Conversations_Bool_Exp>;
};

/** Ordering options when selecting data from "conversations". */
export type Conversations_Order_By = {
  coze_conversation_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_message_at?: InputMaybe<Order_By>;
  message_count?: InputMaybe<Order_By>;
  participant_fish_ids?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  topic?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: conversations */
export type Conversations_Pk_Columns_Input = {
  /** 主键UUID */
  id: Scalars['uuid']['input'];
};

/** select columns of table "conversations" */
export enum Conversations_Select_Column {
  /** column name */
  CozeConversationId = 'coze_conversation_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  LastMessageAt = 'last_message_at',
  /** column name */
  MessageCount = 'message_count',
  /** column name */
  ParticipantFishIds = 'participant_fish_ids',
  /** column name */
  Status = 'status',
  /** column name */
  Topic = 'topic',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "conversations" */
export type Conversations_Set_Input = {
  /** Coze API返回的conversation ID */
  coze_conversation_id?: InputMaybe<Scalars['String']['input']>;
  /** 创建时间 */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 过期时间（7天后，不主动检查） */
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 主键UUID */
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 最后一条消息时间 */
  last_message_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 消息计数 */
  message_count?: InputMaybe<Scalars['Int']['input']>;
  /** 参与对话的鱼ID数组 */
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  /** 状态：active-活跃, expired-已过期 */
  status?: InputMaybe<Scalars['String']['input']>;
  /** 对话主题 */
  topic?: InputMaybe<Scalars['String']['input']>;
  /** 最后更新时间 */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 发起对话的用户ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Conversations_Stddev_Fields = {
  __typename?: 'conversations_stddev_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Conversations_Stddev_Pop_Fields = {
  __typename?: 'conversations_stddev_pop_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Conversations_Stddev_Samp_Fields = {
  __typename?: 'conversations_stddev_samp_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "conversations" */
export type Conversations_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Conversations_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Conversations_Stream_Cursor_Value_Input = {
  /** Coze API返回的conversation ID */
  coze_conversation_id?: InputMaybe<Scalars['String']['input']>;
  /** 创建时间 */
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 过期时间（7天后，不主动检查） */
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 主键UUID */
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 最后一条消息时间 */
  last_message_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 消息计数 */
  message_count?: InputMaybe<Scalars['Int']['input']>;
  /** 参与对话的鱼ID数组 */
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  /** 状态：active-活跃, expired-已过期 */
  status?: InputMaybe<Scalars['String']['input']>;
  /** 对话主题 */
  topic?: InputMaybe<Scalars['String']['input']>;
  /** 最后更新时间 */
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 发起对话的用户ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Conversations_Sum_Fields = {
  __typename?: 'conversations_sum_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "conversations" */
export enum Conversations_Update_Column {
  /** column name */
  CozeConversationId = 'coze_conversation_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  LastMessageAt = 'last_message_at',
  /** column name */
  MessageCount = 'message_count',
  /** column name */
  ParticipantFishIds = 'participant_fish_ids',
  /** column name */
  Status = 'status',
  /** column name */
  Topic = 'topic',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type Conversations_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Conversations_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Conversations_Set_Input>;
  /** filter the rows which have to be updated */
  where: Conversations_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Conversations_Var_Pop_Fields = {
  __typename?: 'conversations_var_pop_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Conversations_Var_Samp_Fields = {
  __typename?: 'conversations_var_samp_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Conversations_Variance_Fields = {
  __typename?: 'conversations_variance_fields';
  /** 消息计数 */
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** columns and relationships of "fish" */
export type Fish = {
  __typename?: 'fish';
  artist?: Maybe<Scalars['String']['output']>;
  chat_frequency?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** An array relationship */
  fish_favorites: Array<Fish_Favorites>;
  /** An aggregate relationship */
  fish_favorites_aggregate: Fish_Favorites_Aggregate;
  fish_name?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  fish_personality?: Maybe<Fish_Personalities>;
  id: Scalars['uuid']['output'];
  image_url: Scalars['String']['output'];
  is_approved?: Maybe<Scalars['Boolean']['output']>;
  /** An array relationship */
  messages: Array<Messages>;
  /** An aggregate relationship */
  messages_aggregate: Messages_Aggregate;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: Maybe<Scalars['String']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  reported?: Maybe<Scalars['Boolean']['output']>;
  /** An array relationship */
  reports: Array<Reports>;
  /** An aggregate relationship */
  reports_aggregate: Reports_Aggregate;
  upvotes: Scalars['Int']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['String']['output'];
  /** An array relationship */
  votes: Array<Votes>;
  /** An aggregate relationship */
  votes_aggregate: Votes_Aggregate;
};


/** columns and relationships of "fish" */
export type FishFish_FavoritesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Favorites_Order_By>>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishFish_Favorites_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Favorites_Order_By>>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishMessagesArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishMessages_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishReportsArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishReports_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishVotesArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishVotes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};

/** aggregated selection of "fish" */
export type Fish_Aggregate = {
  __typename?: 'fish_aggregate';
  aggregate?: Maybe<Fish_Aggregate_Fields>;
  nodes: Array<Fish>;
};

export type Fish_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Fish_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Fish_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Fish_Aggregate_Bool_Exp_Count>;
};

export type Fish_Aggregate_Bool_Exp_Bool_And = {
  arguments: Fish_Select_Column_Fish_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Fish_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Fish_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Fish_Select_Column_Fish_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Fish_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Fish_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Fish_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Fish_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "fish" */
export type Fish_Aggregate_Fields = {
  __typename?: 'fish_aggregate_fields';
  avg?: Maybe<Fish_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Fish_Max_Fields>;
  min?: Maybe<Fish_Min_Fields>;
  stddev?: Maybe<Fish_Stddev_Fields>;
  stddev_pop?: Maybe<Fish_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Fish_Stddev_Samp_Fields>;
  sum?: Maybe<Fish_Sum_Fields>;
  var_pop?: Maybe<Fish_Var_Pop_Fields>;
  var_samp?: Maybe<Fish_Var_Samp_Fields>;
  variance?: Maybe<Fish_Variance_Fields>;
};


/** aggregate fields of "fish" */
export type Fish_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Fish_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "fish" */
export type Fish_Aggregate_Order_By = {
  avg?: InputMaybe<Fish_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Fish_Max_Order_By>;
  min?: InputMaybe<Fish_Min_Order_By>;
  stddev?: InputMaybe<Fish_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Fish_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Fish_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Fish_Sum_Order_By>;
  var_pop?: InputMaybe<Fish_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Fish_Var_Samp_Order_By>;
  variance?: InputMaybe<Fish_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "fish" */
export type Fish_Arr_Rel_Insert_Input = {
  data: Array<Fish_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Fish_On_Conflict>;
};

/** aggregate avg on columns */
export type Fish_Avg_Fields = {
  __typename?: 'fish_avg_fields';
  chat_frequency?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "fish" */
export type Fish_Avg_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "fish". All fields are combined with a logical 'AND'. */
export type Fish_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_Bool_Exp>>;
  _not?: InputMaybe<Fish_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_Bool_Exp>>;
  artist?: InputMaybe<String_Comparison_Exp>;
  chat_frequency?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_favorites?: InputMaybe<Fish_Favorites_Bool_Exp>;
  fish_favorites_aggregate?: InputMaybe<Fish_Favorites_Aggregate_Bool_Exp>;
  fish_name?: InputMaybe<String_Comparison_Exp>;
  fish_personality?: InputMaybe<Fish_Personalities_Bool_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image_url?: InputMaybe<String_Comparison_Exp>;
  is_approved?: InputMaybe<Boolean_Comparison_Exp>;
  messages?: InputMaybe<Messages_Bool_Exp>;
  messages_aggregate?: InputMaybe<Messages_Aggregate_Bool_Exp>;
  personality?: InputMaybe<String_Comparison_Exp>;
  report_count?: InputMaybe<Int_Comparison_Exp>;
  reported?: InputMaybe<Boolean_Comparison_Exp>;
  reports?: InputMaybe<Reports_Bool_Exp>;
  reports_aggregate?: InputMaybe<Reports_Aggregate_Bool_Exp>;
  upvotes?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
  votes?: InputMaybe<Votes_Bool_Exp>;
  votes_aggregate?: InputMaybe<Votes_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "fish" */
export enum Fish_Constraint {
  /** unique or primary key constraint on columns "id" */
  FishPkey = 'fish_pkey'
}

/** Stores users favorite fish for their private tank */
export type Fish_Favorites = {
  __typename?: 'fish_favorites';
  /** When the fish was favorited */
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** An object relationship */
  fish: Fish;
  /** Reference to fish table */
  fish_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  /** Supabase Auth user ID */
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "fish_favorites" */
export type Fish_Favorites_Aggregate = {
  __typename?: 'fish_favorites_aggregate';
  aggregate?: Maybe<Fish_Favorites_Aggregate_Fields>;
  nodes: Array<Fish_Favorites>;
};

export type Fish_Favorites_Aggregate_Bool_Exp = {
  count?: InputMaybe<Fish_Favorites_Aggregate_Bool_Exp_Count>;
};

export type Fish_Favorites_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Fish_Favorites_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "fish_favorites" */
export type Fish_Favorites_Aggregate_Fields = {
  __typename?: 'fish_favorites_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Fish_Favorites_Max_Fields>;
  min?: Maybe<Fish_Favorites_Min_Fields>;
};


/** aggregate fields of "fish_favorites" */
export type Fish_Favorites_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "fish_favorites" */
export type Fish_Favorites_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Fish_Favorites_Max_Order_By>;
  min?: InputMaybe<Fish_Favorites_Min_Order_By>;
};

/** input type for inserting array relation for remote table "fish_favorites" */
export type Fish_Favorites_Arr_Rel_Insert_Input = {
  data: Array<Fish_Favorites_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Fish_Favorites_On_Conflict>;
};

/** Boolean expression to filter rows from the table "fish_favorites". All fields are combined with a logical 'AND'. */
export type Fish_Favorites_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_Favorites_Bool_Exp>>;
  _not?: InputMaybe<Fish_Favorites_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_Favorites_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish?: InputMaybe<Fish_Bool_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "fish_favorites" */
export enum Fish_Favorites_Constraint {
  /** unique or primary key constraint on columns "id" */
  FishFavoritesPkey = 'fish_favorites_pkey',
  /** unique or primary key constraint on columns "user_id", "fish_id" */
  UniqueUserFishFavorite = 'unique_user_fish_favorite'
}

/** input type for inserting data into table "fish_favorites" */
export type Fish_Favorites_Insert_Input = {
  /** When the fish was favorited */
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish?: InputMaybe<Fish_Obj_Rel_Insert_Input>;
  /** Reference to fish table */
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** Supabase Auth user ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Fish_Favorites_Max_Fields = {
  __typename?: 'fish_favorites_max_fields';
  /** When the fish was favorited */
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** Reference to fish table */
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Supabase Auth user ID */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "fish_favorites" */
export type Fish_Favorites_Max_Order_By = {
  /** When the fish was favorited */
  created_at?: InputMaybe<Order_By>;
  /** Reference to fish table */
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Supabase Auth user ID */
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Fish_Favorites_Min_Fields = {
  __typename?: 'fish_favorites_min_fields';
  /** When the fish was favorited */
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** Reference to fish table */
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Supabase Auth user ID */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "fish_favorites" */
export type Fish_Favorites_Min_Order_By = {
  /** When the fish was favorited */
  created_at?: InputMaybe<Order_By>;
  /** Reference to fish table */
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Supabase Auth user ID */
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "fish_favorites" */
export type Fish_Favorites_Mutation_Response = {
  __typename?: 'fish_favorites_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Fish_Favorites>;
};

/** on_conflict condition type for table "fish_favorites" */
export type Fish_Favorites_On_Conflict = {
  constraint: Fish_Favorites_Constraint;
  update_columns?: Array<Fish_Favorites_Update_Column>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};

/** Ordering options when selecting data from "fish_favorites". */
export type Fish_Favorites_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish?: InputMaybe<Fish_Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: fish_favorites */
export type Fish_Favorites_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "fish_favorites" */
export enum Fish_Favorites_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "fish_favorites" */
export type Fish_Favorites_Set_Input = {
  /** When the fish was favorited */
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** Reference to fish table */
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** Supabase Auth user ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "fish_favorites" */
export type Fish_Favorites_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Fish_Favorites_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Fish_Favorites_Stream_Cursor_Value_Input = {
  /** When the fish was favorited */
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** Reference to fish table */
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** Supabase Auth user ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "fish_favorites" */
export enum Fish_Favorites_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id'
}

export type Fish_Favorites_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Fish_Favorites_Set_Input>;
  /** filter the rows which have to be updated */
  where: Fish_Favorites_Bool_Exp;
};

/** input type for incrementing numeric columns in table "fish" */
export type Fish_Inc_Input = {
  chat_frequency?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "fish" */
export type Fish_Insert_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  chat_frequency?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_favorites?: InputMaybe<Fish_Favorites_Arr_Rel_Insert_Input>;
  fish_name?: InputMaybe<Scalars['String']['input']>;
  fish_personality?: InputMaybe<Fish_Personalities_Obj_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  messages?: InputMaybe<Messages_Arr_Rel_Insert_Input>;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: InputMaybe<Scalars['String']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  reports?: InputMaybe<Reports_Arr_Rel_Insert_Input>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['String']['input']>;
  votes?: InputMaybe<Votes_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Fish_Max_Fields = {
  __typename?: 'fish_max_fields';
  artist?: Maybe<Scalars['String']['output']>;
  chat_frequency?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: Maybe<Scalars['String']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "fish" */
export type Fish_Max_Order_By = {
  artist?: InputMaybe<Order_By>;
  chat_frequency?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Fish_Min_Fields = {
  __typename?: 'fish_min_fields';
  artist?: Maybe<Scalars['String']['output']>;
  chat_frequency?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: Maybe<Scalars['String']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "fish" */
export type Fish_Min_Order_By = {
  artist?: InputMaybe<Order_By>;
  chat_frequency?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** 鱼自语内容表 - 存储按个性分类的预设自语内容（英文美式幽默风格） */
export type Fish_Monologues = {
  __typename?: 'fish_monologues';
  /** 自语内容（英文） */
  content: Scalars['String']['output'];
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** An object relationship */
  fish_personality?: Maybe<Fish_Personalities>;
  id: Scalars['uuid']['output'];
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "fish_monologues" */
export type Fish_Monologues_Aggregate = {
  __typename?: 'fish_monologues_aggregate';
  aggregate?: Maybe<Fish_Monologues_Aggregate_Fields>;
  nodes: Array<Fish_Monologues>;
};

export type Fish_Monologues_Aggregate_Bool_Exp = {
  count?: InputMaybe<Fish_Monologues_Aggregate_Bool_Exp_Count>;
};

export type Fish_Monologues_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Fish_Monologues_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "fish_monologues" */
export type Fish_Monologues_Aggregate_Fields = {
  __typename?: 'fish_monologues_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Fish_Monologues_Max_Fields>;
  min?: Maybe<Fish_Monologues_Min_Fields>;
};


/** aggregate fields of "fish_monologues" */
export type Fish_Monologues_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "fish_monologues" */
export type Fish_Monologues_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Fish_Monologues_Max_Order_By>;
  min?: InputMaybe<Fish_Monologues_Min_Order_By>;
};

/** input type for inserting array relation for remote table "fish_monologues" */
export type Fish_Monologues_Arr_Rel_Insert_Input = {
  data: Array<Fish_Monologues_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Fish_Monologues_On_Conflict>;
};

/** Boolean expression to filter rows from the table "fish_monologues". All fields are combined with a logical 'AND'. */
export type Fish_Monologues_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_Monologues_Bool_Exp>>;
  _not?: InputMaybe<Fish_Monologues_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_Monologues_Bool_Exp>>;
  content?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_personality?: InputMaybe<Fish_Personalities_Bool_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  personality?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "fish_monologues" */
export enum Fish_Monologues_Constraint {
  /** unique or primary key constraint on columns "id" */
  FishMonologuesPkey = 'fish_monologues_pkey'
}

/** input type for inserting data into table "fish_monologues" */
export type Fish_Monologues_Insert_Input = {
  /** 自语内容（英文） */
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_personality?: InputMaybe<Fish_Personalities_Obj_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Fish_Monologues_Max_Fields = {
  __typename?: 'fish_monologues_max_fields';
  /** 自语内容（英文） */
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "fish_monologues" */
export type Fish_Monologues_Max_Order_By = {
  /** 自语内容（英文） */
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Fish_Monologues_Min_Fields = {
  __typename?: 'fish_monologues_min_fields';
  /** 自语内容（英文） */
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "fish_monologues" */
export type Fish_Monologues_Min_Order_By = {
  /** 自语内容（英文） */
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "fish_monologues" */
export type Fish_Monologues_Mutation_Response = {
  __typename?: 'fish_monologues_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Fish_Monologues>;
};

/** on_conflict condition type for table "fish_monologues" */
export type Fish_Monologues_On_Conflict = {
  constraint: Fish_Monologues_Constraint;
  update_columns?: Array<Fish_Monologues_Update_Column>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};

/** Ordering options when selecting data from "fish_monologues". */
export type Fish_Monologues_Order_By = {
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_personality?: InputMaybe<Fish_Personalities_Order_By>;
  id?: InputMaybe<Order_By>;
  personality?: InputMaybe<Order_By>;
};

/** primary key columns input for table: fish_monologues */
export type Fish_Monologues_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "fish_monologues" */
export enum Fish_Monologues_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Personality = 'personality'
}

/** input type for updating data in table "fish_monologues" */
export type Fish_Monologues_Set_Input = {
  /** 自语内容（英文） */
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "fish_monologues" */
export type Fish_Monologues_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Fish_Monologues_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Fish_Monologues_Stream_Cursor_Value_Input = {
  /** 自语内容（英文） */
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 个性类型（关联 fish_personalities.name）- NULL表示通用自语 */
  personality?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "fish_monologues" */
export enum Fish_Monologues_Update_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Personality = 'personality'
}

export type Fish_Monologues_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Fish_Monologues_Set_Input>;
  /** filter the rows which have to be updated */
  where: Fish_Monologues_Bool_Exp;
};

/** response of any mutation on the table "fish" */
export type Fish_Mutation_Response = {
  __typename?: 'fish_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Fish>;
};

/** input type for inserting object relation for remote table "fish" */
export type Fish_Obj_Rel_Insert_Input = {
  data: Fish_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Fish_On_Conflict>;
};

/** on_conflict condition type for table "fish" */
export type Fish_On_Conflict = {
  constraint: Fish_Constraint;
  update_columns?: Array<Fish_Update_Column>;
  where?: InputMaybe<Fish_Bool_Exp>;
};

/** Ordering options when selecting data from "fish". */
export type Fish_Order_By = {
  artist?: InputMaybe<Order_By>;
  chat_frequency?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_favorites_aggregate?: InputMaybe<Fish_Favorites_Aggregate_Order_By>;
  fish_name?: InputMaybe<Order_By>;
  fish_personality?: InputMaybe<Fish_Personalities_Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  is_approved?: InputMaybe<Order_By>;
  messages_aggregate?: InputMaybe<Messages_Aggregate_Order_By>;
  personality?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  reported?: InputMaybe<Order_By>;
  reports_aggregate?: InputMaybe<Reports_Aggregate_Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  votes_aggregate?: InputMaybe<Votes_Aggregate_Order_By>;
};

/** 鱼个性类型表 - 预设的个性类型及详细描述 */
export type Fish_Personalities = {
  __typename?: 'fish_personalities';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 个性细节描述 - 详细说明该个性的特征和行为模式 */
  description: Scalars['String']['output'];
  /** An array relationship */
  fish_monologues: Array<Fish_Monologues>;
  /** An aggregate relationship */
  fish_monologues_aggregate: Fish_Monologues_Aggregate;
  /** An array relationship */
  fishes: Array<Fish>;
  /** An aggregate relationship */
  fishes_aggregate: Fish_Aggregate;
  id: Scalars['uuid']['output'];
  /** 个性名称（英文，唯一标识） */
  name: Scalars['String']['output'];
  sort?: Maybe<Scalars['bigint']['output']>;
};


/** 鱼个性类型表 - 预设的个性类型及详细描述 */
export type Fish_PersonalitiesFish_MonologuesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Monologues_Order_By>>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};


/** 鱼个性类型表 - 预设的个性类型及详细描述 */
export type Fish_PersonalitiesFish_Monologues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Monologues_Order_By>>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};


/** 鱼个性类型表 - 预设的个性类型及详细描述 */
export type Fish_PersonalitiesFishesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


/** 鱼个性类型表 - 预设的个性类型及详细描述 */
export type Fish_PersonalitiesFishes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};

/** aggregated selection of "fish_personalities" */
export type Fish_Personalities_Aggregate = {
  __typename?: 'fish_personalities_aggregate';
  aggregate?: Maybe<Fish_Personalities_Aggregate_Fields>;
  nodes: Array<Fish_Personalities>;
};

/** aggregate fields of "fish_personalities" */
export type Fish_Personalities_Aggregate_Fields = {
  __typename?: 'fish_personalities_aggregate_fields';
  avg?: Maybe<Fish_Personalities_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Fish_Personalities_Max_Fields>;
  min?: Maybe<Fish_Personalities_Min_Fields>;
  stddev?: Maybe<Fish_Personalities_Stddev_Fields>;
  stddev_pop?: Maybe<Fish_Personalities_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Fish_Personalities_Stddev_Samp_Fields>;
  sum?: Maybe<Fish_Personalities_Sum_Fields>;
  var_pop?: Maybe<Fish_Personalities_Var_Pop_Fields>;
  var_samp?: Maybe<Fish_Personalities_Var_Samp_Fields>;
  variance?: Maybe<Fish_Personalities_Variance_Fields>;
};


/** aggregate fields of "fish_personalities" */
export type Fish_Personalities_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Fish_Personalities_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Fish_Personalities_Avg_Fields = {
  __typename?: 'fish_personalities_avg_fields';
  sort?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "fish_personalities". All fields are combined with a logical 'AND'. */
export type Fish_Personalities_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_Personalities_Bool_Exp>>;
  _not?: InputMaybe<Fish_Personalities_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_Personalities_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  fish_monologues?: InputMaybe<Fish_Monologues_Bool_Exp>;
  fish_monologues_aggregate?: InputMaybe<Fish_Monologues_Aggregate_Bool_Exp>;
  fishes?: InputMaybe<Fish_Bool_Exp>;
  fishes_aggregate?: InputMaybe<Fish_Aggregate_Bool_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  sort?: InputMaybe<Bigint_Comparison_Exp>;
};

/** unique or primary key constraints on table "fish_personalities" */
export enum Fish_Personalities_Constraint {
  /** unique or primary key constraint on columns "name" */
  FishPersonalitiesNameKey = 'fish_personalities_name_key',
  /** unique or primary key constraint on columns "id" */
  FishPersonalitiesPkey = 'fish_personalities_pkey'
}

/** input type for incrementing numeric columns in table "fish_personalities" */
export type Fish_Personalities_Inc_Input = {
  sort?: InputMaybe<Scalars['bigint']['input']>;
};

/** input type for inserting data into table "fish_personalities" */
export type Fish_Personalities_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 个性细节描述 - 详细说明该个性的特征和行为模式 */
  description?: InputMaybe<Scalars['String']['input']>;
  fish_monologues?: InputMaybe<Fish_Monologues_Arr_Rel_Insert_Input>;
  fishes?: InputMaybe<Fish_Arr_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 个性名称（英文，唯一标识） */
  name?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate max on columns */
export type Fish_Personalities_Max_Fields = {
  __typename?: 'fish_personalities_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 个性细节描述 - 详细说明该个性的特征和行为模式 */
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** 个性名称（英文，唯一标识） */
  name?: Maybe<Scalars['String']['output']>;
  sort?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate min on columns */
export type Fish_Personalities_Min_Fields = {
  __typename?: 'fish_personalities_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** 个性细节描述 - 详细说明该个性的特征和行为模式 */
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** 个性名称（英文，唯一标识） */
  name?: Maybe<Scalars['String']['output']>;
  sort?: Maybe<Scalars['bigint']['output']>;
};

/** response of any mutation on the table "fish_personalities" */
export type Fish_Personalities_Mutation_Response = {
  __typename?: 'fish_personalities_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Fish_Personalities>;
};

/** input type for inserting object relation for remote table "fish_personalities" */
export type Fish_Personalities_Obj_Rel_Insert_Input = {
  data: Fish_Personalities_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Fish_Personalities_On_Conflict>;
};

/** on_conflict condition type for table "fish_personalities" */
export type Fish_Personalities_On_Conflict = {
  constraint: Fish_Personalities_Constraint;
  update_columns?: Array<Fish_Personalities_Update_Column>;
  where?: InputMaybe<Fish_Personalities_Bool_Exp>;
};

/** Ordering options when selecting data from "fish_personalities". */
export type Fish_Personalities_Order_By = {
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  fish_monologues_aggregate?: InputMaybe<Fish_Monologues_Aggregate_Order_By>;
  fishes_aggregate?: InputMaybe<Fish_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  sort?: InputMaybe<Order_By>;
};

/** primary key columns input for table: fish_personalities */
export type Fish_Personalities_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "fish_personalities" */
export enum Fish_Personalities_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Sort = 'sort'
}

/** input type for updating data in table "fish_personalities" */
export type Fish_Personalities_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 个性细节描述 - 详细说明该个性的特征和行为模式 */
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 个性名称（英文，唯一标识） */
  name?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate stddev on columns */
export type Fish_Personalities_Stddev_Fields = {
  __typename?: 'fish_personalities_stddev_fields';
  sort?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Fish_Personalities_Stddev_Pop_Fields = {
  __typename?: 'fish_personalities_stddev_pop_fields';
  sort?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Fish_Personalities_Stddev_Samp_Fields = {
  __typename?: 'fish_personalities_stddev_samp_fields';
  sort?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "fish_personalities" */
export type Fish_Personalities_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Fish_Personalities_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Fish_Personalities_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** 个性细节描述 - 详细说明该个性的特征和行为模式 */
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 个性名称（英文，唯一标识） */
  name?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate sum on columns */
export type Fish_Personalities_Sum_Fields = {
  __typename?: 'fish_personalities_sum_fields';
  sort?: Maybe<Scalars['bigint']['output']>;
};

/** update columns of table "fish_personalities" */
export enum Fish_Personalities_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Sort = 'sort'
}

export type Fish_Personalities_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Fish_Personalities_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Fish_Personalities_Set_Input>;
  /** filter the rows which have to be updated */
  where: Fish_Personalities_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Fish_Personalities_Var_Pop_Fields = {
  __typename?: 'fish_personalities_var_pop_fields';
  sort?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Fish_Personalities_Var_Samp_Fields = {
  __typename?: 'fish_personalities_var_samp_fields';
  sort?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Fish_Personalities_Variance_Fields = {
  __typename?: 'fish_personalities_variance_fields';
  sort?: Maybe<Scalars['Float']['output']>;
};

/** primary key columns input for table: fish */
export type Fish_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "fish" */
export enum Fish_Select_Column {
  /** column name */
  Artist = 'artist',
  /** column name */
  ChatFrequency = 'chat_frequency',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishName = 'fish_name',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'image_url',
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  Personality = 'personality',
  /** column name */
  ReportCount = 'report_count',
  /** column name */
  Reported = 'reported',
  /** column name */
  Upvotes = 'upvotes',
  /** column name */
  UserId = 'user_id'
}

/** select "fish_aggregate_bool_exp_bool_and_arguments_columns" columns of table "fish" */
export enum Fish_Select_Column_Fish_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  Reported = 'reported'
}

/** select "fish_aggregate_bool_exp_bool_or_arguments_columns" columns of table "fish" */
export enum Fish_Select_Column_Fish_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  Reported = 'reported'
}

/** input type for updating data in table "fish" */
export type Fish_Set_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  chat_frequency?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: InputMaybe<Scalars['String']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Fish_Stddev_Fields = {
  __typename?: 'fish_stddev_fields';
  chat_frequency?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "fish" */
export type Fish_Stddev_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Fish_Stddev_Pop_Fields = {
  __typename?: 'fish_stddev_pop_fields';
  chat_frequency?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "fish" */
export type Fish_Stddev_Pop_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Fish_Stddev_Samp_Fields = {
  __typename?: 'fish_stddev_samp_fields';
  chat_frequency?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "fish" */
export type Fish_Stddev_Samp_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "fish" */
export type Fish_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Fish_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Fish_Stream_Cursor_Value_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  chat_frequency?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  /** 鱼的个性描述 - 支持自定义输入（如cheerful, shy, brave, lazy或其他） */
  personality?: InputMaybe<Scalars['String']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Fish_Sum_Fields = {
  __typename?: 'fish_sum_fields';
  chat_frequency?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "fish" */
export type Fish_Sum_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** update columns of table "fish" */
export enum Fish_Update_Column {
  /** column name */
  Artist = 'artist',
  /** column name */
  ChatFrequency = 'chat_frequency',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishName = 'fish_name',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'image_url',
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  Personality = 'personality',
  /** column name */
  ReportCount = 'report_count',
  /** column name */
  Reported = 'reported',
  /** column name */
  Upvotes = 'upvotes',
  /** column name */
  UserId = 'user_id'
}

export type Fish_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Fish_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Fish_Set_Input>;
  /** filter the rows which have to be updated */
  where: Fish_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Fish_Var_Pop_Fields = {
  __typename?: 'fish_var_pop_fields';
  chat_frequency?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "fish" */
export type Fish_Var_Pop_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Fish_Var_Samp_Fields = {
  __typename?: 'fish_var_samp_fields';
  chat_frequency?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "fish" */
export type Fish_Var_Samp_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Fish_Variance_Fields = {
  __typename?: 'fish_variance_fields';
  chat_frequency?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "fish" */
export type Fish_Variance_Order_By = {
  chat_frequency?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** 全局参数配置表 - 存储系统级可调整参数 */
export type Global_Params = {
  __typename?: 'global_params';
  /** 参数说明 */
  description?: Maybe<Scalars['String']['output']>;
  /** 参数键名 */
  key: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** 参数值 */
  value: Scalars['String']['output'];
};

/** aggregated selection of "global_params" */
export type Global_Params_Aggregate = {
  __typename?: 'global_params_aggregate';
  aggregate?: Maybe<Global_Params_Aggregate_Fields>;
  nodes: Array<Global_Params>;
};

/** aggregate fields of "global_params" */
export type Global_Params_Aggregate_Fields = {
  __typename?: 'global_params_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Global_Params_Max_Fields>;
  min?: Maybe<Global_Params_Min_Fields>;
};


/** aggregate fields of "global_params" */
export type Global_Params_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Global_Params_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "global_params". All fields are combined with a logical 'AND'. */
export type Global_Params_Bool_Exp = {
  _and?: InputMaybe<Array<Global_Params_Bool_Exp>>;
  _not?: InputMaybe<Global_Params_Bool_Exp>;
  _or?: InputMaybe<Array<Global_Params_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  key?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "global_params" */
export enum Global_Params_Constraint {
  /** unique or primary key constraint on columns "key" */
  GlobalParamsPkey = 'global_params_pkey'
}

/** input type for inserting data into table "global_params" */
export type Global_Params_Insert_Input = {
  /** 参数说明 */
  description?: InputMaybe<Scalars['String']['input']>;
  /** 参数键名 */
  key?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 参数值 */
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Global_Params_Max_Fields = {
  __typename?: 'global_params_max_fields';
  /** 参数说明 */
  description?: Maybe<Scalars['String']['output']>;
  /** 参数键名 */
  key?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** 参数值 */
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Global_Params_Min_Fields = {
  __typename?: 'global_params_min_fields';
  /** 参数说明 */
  description?: Maybe<Scalars['String']['output']>;
  /** 参数键名 */
  key?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** 参数值 */
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "global_params" */
export type Global_Params_Mutation_Response = {
  __typename?: 'global_params_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Global_Params>;
};

/** on_conflict condition type for table "global_params" */
export type Global_Params_On_Conflict = {
  constraint: Global_Params_Constraint;
  update_columns?: Array<Global_Params_Update_Column>;
  where?: InputMaybe<Global_Params_Bool_Exp>;
};

/** Ordering options when selecting data from "global_params". */
export type Global_Params_Order_By = {
  description?: InputMaybe<Order_By>;
  key?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: global_params */
export type Global_Params_Pk_Columns_Input = {
  /** 参数键名 */
  key: Scalars['String']['input'];
};

/** select columns of table "global_params" */
export enum Global_Params_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Key = 'key',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "global_params" */
export type Global_Params_Set_Input = {
  /** 参数说明 */
  description?: InputMaybe<Scalars['String']['input']>;
  /** 参数键名 */
  key?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 参数值 */
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "global_params" */
export type Global_Params_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Global_Params_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Global_Params_Stream_Cursor_Value_Input = {
  /** 参数说明 */
  description?: InputMaybe<Scalars['String']['input']>;
  /** 参数键名 */
  key?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 参数值 */
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "global_params" */
export enum Global_Params_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Key = 'key',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Value = 'value'
}

export type Global_Params_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Global_Params_Set_Input>;
  /** filter the rows which have to be updated */
  where: Global_Params_Bool_Exp;
};

/** Stores batch dialogues generated by COZE AI for community chat */
export type Group_Chat = {
  __typename?: 'group_chat';
  /** 关联的conversation ID（可选） */
  conversation_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues: Scalars['jsonb']['output'];
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Int']['output']>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: Maybe<Scalars['timestamp']['output']>;
  id: Scalars['uuid']['output'];
  initiator_user_id?: Maybe<Scalars['String']['output']>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids: Array<Scalars['uuid']['output']>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: Maybe<Scalars['String']['output']>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic: Scalars['String']['output'];
  /** An object relationship */
  user?: Maybe<Users>;
  user_talk?: Maybe<Scalars['String']['output']>;
};


/** Stores batch dialogues generated by COZE AI for community chat */
export type Group_ChatDialoguesArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "group_chat" */
export type Group_Chat_Aggregate = {
  __typename?: 'group_chat_aggregate';
  aggregate?: Maybe<Group_Chat_Aggregate_Fields>;
  nodes: Array<Group_Chat>;
};

export type Group_Chat_Aggregate_Bool_Exp = {
  count?: InputMaybe<Group_Chat_Aggregate_Bool_Exp_Count>;
};

export type Group_Chat_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Group_Chat_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Group_Chat_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "group_chat" */
export type Group_Chat_Aggregate_Fields = {
  __typename?: 'group_chat_aggregate_fields';
  avg?: Maybe<Group_Chat_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Group_Chat_Max_Fields>;
  min?: Maybe<Group_Chat_Min_Fields>;
  stddev?: Maybe<Group_Chat_Stddev_Fields>;
  stddev_pop?: Maybe<Group_Chat_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Group_Chat_Stddev_Samp_Fields>;
  sum?: Maybe<Group_Chat_Sum_Fields>;
  var_pop?: Maybe<Group_Chat_Var_Pop_Fields>;
  var_samp?: Maybe<Group_Chat_Var_Samp_Fields>;
  variance?: Maybe<Group_Chat_Variance_Fields>;
};


/** aggregate fields of "group_chat" */
export type Group_Chat_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Group_Chat_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "group_chat" */
export type Group_Chat_Aggregate_Order_By = {
  avg?: InputMaybe<Group_Chat_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Group_Chat_Max_Order_By>;
  min?: InputMaybe<Group_Chat_Min_Order_By>;
  stddev?: InputMaybe<Group_Chat_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Group_Chat_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Group_Chat_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Group_Chat_Sum_Order_By>;
  var_pop?: InputMaybe<Group_Chat_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Group_Chat_Var_Samp_Order_By>;
  variance?: InputMaybe<Group_Chat_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Group_Chat_Append_Input = {
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "group_chat" */
export type Group_Chat_Arr_Rel_Insert_Input = {
  data: Array<Group_Chat_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Group_Chat_On_Conflict>;
};

/** aggregate avg on columns */
export type Group_Chat_Avg_Fields = {
  __typename?: 'group_chat_avg_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "group_chat" */
export type Group_Chat_Avg_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "group_chat". All fields are combined with a logical 'AND'. */
export type Group_Chat_Bool_Exp = {
  _and?: InputMaybe<Array<Group_Chat_Bool_Exp>>;
  _not?: InputMaybe<Group_Chat_Bool_Exp>;
  _or?: InputMaybe<Array<Group_Chat_Bool_Exp>>;
  conversation_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  dialogues?: InputMaybe<Jsonb_Comparison_Exp>;
  display_duration?: InputMaybe<Int_Comparison_Exp>;
  expires_at?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  initiator_user_id?: InputMaybe<String_Comparison_Exp>;
  participant_fish_ids?: InputMaybe<Uuid_Array_Comparison_Exp>;
  time_of_day?: InputMaybe<String_Comparison_Exp>;
  topic?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_talk?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "group_chat" */
export enum Group_Chat_Constraint {
  /** unique or primary key constraint on columns "id" */
  CommunityChatSessionsPkey = 'community_chat_sessions_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Group_Chat_Delete_At_Path_Input = {
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Group_Chat_Delete_Elem_Input = {
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Group_Chat_Delete_Key_Input = {
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "group_chat" */
export type Group_Chat_Inc_Input = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "group_chat" */
export type Group_Chat_Insert_Input = {
  /** 关联的conversation ID（可选） */
  conversation_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Scalars['jsonb']['input']>;
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Scalars['Int']['input']>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  initiator_user_id?: InputMaybe<Scalars['String']['input']>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: InputMaybe<Scalars['String']['input']>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_talk?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Group_Chat_Max_Fields = {
  __typename?: 'group_chat_max_fields';
  /** 关联的conversation ID（可选） */
  conversation_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Int']['output']>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  initiator_user_id?: Maybe<Scalars['String']['output']>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids?: Maybe<Array<Scalars['uuid']['output']>>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: Maybe<Scalars['String']['output']>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic?: Maybe<Scalars['String']['output']>;
  user_talk?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "group_chat" */
export type Group_Chat_Max_Order_By = {
  /** 关联的conversation ID（可选） */
  conversation_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_user_id?: InputMaybe<Order_By>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids?: InputMaybe<Order_By>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: InputMaybe<Order_By>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic?: InputMaybe<Order_By>;
  user_talk?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Group_Chat_Min_Fields = {
  __typename?: 'group_chat_min_fields';
  /** 关联的conversation ID（可选） */
  conversation_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Int']['output']>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  initiator_user_id?: Maybe<Scalars['String']['output']>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids?: Maybe<Array<Scalars['uuid']['output']>>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: Maybe<Scalars['String']['output']>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic?: Maybe<Scalars['String']['output']>;
  user_talk?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "group_chat" */
export type Group_Chat_Min_Order_By = {
  /** 关联的conversation ID（可选） */
  conversation_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_user_id?: InputMaybe<Order_By>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids?: InputMaybe<Order_By>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: InputMaybe<Order_By>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic?: InputMaybe<Order_By>;
  user_talk?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "group_chat" */
export type Group_Chat_Mutation_Response = {
  __typename?: 'group_chat_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Group_Chat>;
};

/** on_conflict condition type for table "group_chat" */
export type Group_Chat_On_Conflict = {
  constraint: Group_Chat_Constraint;
  update_columns?: Array<Group_Chat_Update_Column>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};

/** Ordering options when selecting data from "group_chat". */
export type Group_Chat_Order_By = {
  conversation_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  dialogues?: InputMaybe<Order_By>;
  display_duration?: InputMaybe<Order_By>;
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  initiator_user_id?: InputMaybe<Order_By>;
  participant_fish_ids?: InputMaybe<Order_By>;
  time_of_day?: InputMaybe<Order_By>;
  topic?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_talk?: InputMaybe<Order_By>;
};

/** primary key columns input for table: group_chat */
export type Group_Chat_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Group_Chat_Prepend_Input = {
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "group_chat" */
export enum Group_Chat_Select_Column {
  /** column name */
  ConversationId = 'conversation_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Dialogues = 'dialogues',
  /** column name */
  DisplayDuration = 'display_duration',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  InitiatorUserId = 'initiator_user_id',
  /** column name */
  ParticipantFishIds = 'participant_fish_ids',
  /** column name */
  TimeOfDay = 'time_of_day',
  /** column name */
  Topic = 'topic',
  /** column name */
  UserTalk = 'user_talk'
}

/** input type for updating data in table "group_chat" */
export type Group_Chat_Set_Input = {
  /** 关联的conversation ID（可选） */
  conversation_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Scalars['jsonb']['input']>;
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Scalars['Int']['input']>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  initiator_user_id?: InputMaybe<Scalars['String']['input']>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: InputMaybe<Scalars['String']['input']>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic?: InputMaybe<Scalars['String']['input']>;
  user_talk?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Group_Chat_Stddev_Fields = {
  __typename?: 'group_chat_stddev_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "group_chat" */
export type Group_Chat_Stddev_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Group_Chat_Stddev_Pop_Fields = {
  __typename?: 'group_chat_stddev_pop_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "group_chat" */
export type Group_Chat_Stddev_Pop_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Group_Chat_Stddev_Samp_Fields = {
  __typename?: 'group_chat_stddev_samp_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "group_chat" */
export type Group_Chat_Stddev_Samp_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "group_chat" */
export type Group_Chat_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Group_Chat_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Group_Chat_Stream_Cursor_Value_Input = {
  /** 关联的conversation ID（可选） */
  conversation_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** Full dialogue JSON: {messages: [{fishId, fishName, message, sequence}]} */
  dialogues?: InputMaybe<Scalars['jsonb']['input']>;
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Scalars['Int']['input']>;
  /** Auto-cleanup date (7 days from creation) */
  expires_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  initiator_user_id?: InputMaybe<Scalars['String']['input']>;
  /** Array of fish IDs that participated in this chat */
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  /** Time period: morning, afternoon, evening, night */
  time_of_day?: InputMaybe<Scalars['String']['input']>;
  /** Chat topic, e.g., "Morning Greetings", "Swimming Fun" */
  topic?: InputMaybe<Scalars['String']['input']>;
  user_talk?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Group_Chat_Sum_Fields = {
  __typename?: 'group_chat_sum_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "group_chat" */
export type Group_Chat_Sum_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

/** update columns of table "group_chat" */
export enum Group_Chat_Update_Column {
  /** column name */
  ConversationId = 'conversation_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Dialogues = 'dialogues',
  /** column name */
  DisplayDuration = 'display_duration',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  InitiatorUserId = 'initiator_user_id',
  /** column name */
  ParticipantFishIds = 'participant_fish_ids',
  /** column name */
  TimeOfDay = 'time_of_day',
  /** column name */
  Topic = 'topic',
  /** column name */
  UserTalk = 'user_talk'
}

export type Group_Chat_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Group_Chat_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Group_Chat_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Group_Chat_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Group_Chat_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Group_Chat_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Group_Chat_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Group_Chat_Set_Input>;
  /** filter the rows which have to be updated */
  where: Group_Chat_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Group_Chat_Var_Pop_Fields = {
  __typename?: 'group_chat_var_pop_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "group_chat" */
export type Group_Chat_Var_Pop_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Group_Chat_Var_Samp_Fields = {
  __typename?: 'group_chat_var_samp_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "group_chat" */
export type Group_Chat_Var_Samp_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Group_Chat_Variance_Fields = {
  __typename?: 'group_chat_variance_fields';
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "group_chat" */
export type Group_Chat_Variance_Order_By = {
  /** Total playback duration in seconds (messages × 6) */
  display_duration?: InputMaybe<Order_By>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** 会员类型表：free, plus, premium, admin */
export type Member_Types = {
  __typename?: 'member_types';
  add_to_my_tank_limit?: Maybe<Scalars['String']['output']>;
  /** 该会员类型的鱼是否可以参与群聊 */
  can_group_chat: Scalars['Boolean']['output'];
  /** 该会员类型的鱼是否可以宣传主人 */
  can_promote_owner: Scalars['Boolean']['output'];
  /** 该会员类型的鱼是否可以自语 */
  can_self_talk: Scalars['Boolean']['output'];
  created_at?: Maybe<Scalars['timestamp']['output']>;
  draw_fish_limit?: Maybe<Scalars['String']['output']>;
  fee_per_month?: Maybe<Scalars['numeric']['output']>;
  fee_per_year?: Maybe<Scalars['numeric']['output']>;
  group_chat_daily_limit?: Maybe<Scalars['String']['output']>;
  /** 会员类型标识：free, plus, premium */
  id: Scalars['String']['output'];
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency: Scalars['Int']['output'];
  /** 会员类型名称（显示用） */
  name: Scalars['String']['output'];
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency: Scalars['Int']['output'];
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** An array relationship */
  user_subscriptions: Array<User_Subscriptions>;
  /** An aggregate relationship */
  user_subscriptions_aggregate: User_Subscriptions_Aggregate;
};


/** 会员类型表：free, plus, premium, admin */
export type Member_TypesUser_SubscriptionsArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


/** 会员类型表：free, plus, premium, admin */
export type Member_TypesUser_Subscriptions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};

/** aggregated selection of "member_types" */
export type Member_Types_Aggregate = {
  __typename?: 'member_types_aggregate';
  aggregate?: Maybe<Member_Types_Aggregate_Fields>;
  nodes: Array<Member_Types>;
};

/** aggregate fields of "member_types" */
export type Member_Types_Aggregate_Fields = {
  __typename?: 'member_types_aggregate_fields';
  avg?: Maybe<Member_Types_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Member_Types_Max_Fields>;
  min?: Maybe<Member_Types_Min_Fields>;
  stddev?: Maybe<Member_Types_Stddev_Fields>;
  stddev_pop?: Maybe<Member_Types_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Member_Types_Stddev_Samp_Fields>;
  sum?: Maybe<Member_Types_Sum_Fields>;
  var_pop?: Maybe<Member_Types_Var_Pop_Fields>;
  var_samp?: Maybe<Member_Types_Var_Samp_Fields>;
  variance?: Maybe<Member_Types_Variance_Fields>;
};


/** aggregate fields of "member_types" */
export type Member_Types_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Member_Types_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Member_Types_Avg_Fields = {
  __typename?: 'member_types_avg_fields';
  fee_per_month?: Maybe<Scalars['Float']['output']>;
  fee_per_year?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "member_types". All fields are combined with a logical 'AND'. */
export type Member_Types_Bool_Exp = {
  _and?: InputMaybe<Array<Member_Types_Bool_Exp>>;
  _not?: InputMaybe<Member_Types_Bool_Exp>;
  _or?: InputMaybe<Array<Member_Types_Bool_Exp>>;
  add_to_my_tank_limit?: InputMaybe<String_Comparison_Exp>;
  can_group_chat?: InputMaybe<Boolean_Comparison_Exp>;
  can_promote_owner?: InputMaybe<Boolean_Comparison_Exp>;
  can_self_talk?: InputMaybe<Boolean_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  draw_fish_limit?: InputMaybe<String_Comparison_Exp>;
  fee_per_month?: InputMaybe<Numeric_Comparison_Exp>;
  fee_per_year?: InputMaybe<Numeric_Comparison_Exp>;
  group_chat_daily_limit?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  lead_topic_frequency?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  promote_owner_frequency?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  user_subscriptions?: InputMaybe<User_Subscriptions_Bool_Exp>;
  user_subscriptions_aggregate?: InputMaybe<User_Subscriptions_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "member_types" */
export enum Member_Types_Constraint {
  /** unique or primary key constraint on columns "name" */
  MemberTypesNameKey = 'member_types_name_key',
  /** unique or primary key constraint on columns "id" */
  MemberTypesPkey = 'member_types_pkey'
}

/** input type for incrementing numeric columns in table "member_types" */
export type Member_Types_Inc_Input = {
  fee_per_month?: InputMaybe<Scalars['numeric']['input']>;
  fee_per_year?: InputMaybe<Scalars['numeric']['input']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: InputMaybe<Scalars['Int']['input']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "member_types" */
export type Member_Types_Insert_Input = {
  add_to_my_tank_limit?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼是否可以参与群聊 */
  can_group_chat?: InputMaybe<Scalars['Boolean']['input']>;
  /** 该会员类型的鱼是否可以宣传主人 */
  can_promote_owner?: InputMaybe<Scalars['Boolean']['input']>;
  /** 该会员类型的鱼是否可以自语 */
  can_self_talk?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  draw_fish_limit?: InputMaybe<Scalars['String']['input']>;
  fee_per_month?: InputMaybe<Scalars['numeric']['input']>;
  fee_per_year?: InputMaybe<Scalars['numeric']['input']>;
  group_chat_daily_limit?: InputMaybe<Scalars['String']['input']>;
  /** 会员类型标识：free, plus, premium */
  id?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: InputMaybe<Scalars['Int']['input']>;
  /** 会员类型名称（显示用） */
  name?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  user_subscriptions?: InputMaybe<User_Subscriptions_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Member_Types_Max_Fields = {
  __typename?: 'member_types_max_fields';
  add_to_my_tank_limit?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  draw_fish_limit?: Maybe<Scalars['String']['output']>;
  fee_per_month?: Maybe<Scalars['numeric']['output']>;
  fee_per_year?: Maybe<Scalars['numeric']['output']>;
  group_chat_daily_limit?: Maybe<Scalars['String']['output']>;
  /** 会员类型标识：free, plus, premium */
  id?: Maybe<Scalars['String']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Int']['output']>;
  /** 会员类型名称（显示用） */
  name?: Maybe<Scalars['String']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
};

/** aggregate min on columns */
export type Member_Types_Min_Fields = {
  __typename?: 'member_types_min_fields';
  add_to_my_tank_limit?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  draw_fish_limit?: Maybe<Scalars['String']['output']>;
  fee_per_month?: Maybe<Scalars['numeric']['output']>;
  fee_per_year?: Maybe<Scalars['numeric']['output']>;
  group_chat_daily_limit?: Maybe<Scalars['String']['output']>;
  /** 会员类型标识：free, plus, premium */
  id?: Maybe<Scalars['String']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Int']['output']>;
  /** 会员类型名称（显示用） */
  name?: Maybe<Scalars['String']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
};

/** response of any mutation on the table "member_types" */
export type Member_Types_Mutation_Response = {
  __typename?: 'member_types_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Member_Types>;
};

/** input type for inserting object relation for remote table "member_types" */
export type Member_Types_Obj_Rel_Insert_Input = {
  data: Member_Types_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Member_Types_On_Conflict>;
};

/** on_conflict condition type for table "member_types" */
export type Member_Types_On_Conflict = {
  constraint: Member_Types_Constraint;
  update_columns?: Array<Member_Types_Update_Column>;
  where?: InputMaybe<Member_Types_Bool_Exp>;
};

/** Ordering options when selecting data from "member_types". */
export type Member_Types_Order_By = {
  add_to_my_tank_limit?: InputMaybe<Order_By>;
  can_group_chat?: InputMaybe<Order_By>;
  can_promote_owner?: InputMaybe<Order_By>;
  can_self_talk?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  draw_fish_limit?: InputMaybe<Order_By>;
  fee_per_month?: InputMaybe<Order_By>;
  fee_per_year?: InputMaybe<Order_By>;
  group_chat_daily_limit?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lead_topic_frequency?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  promote_owner_frequency?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_subscriptions_aggregate?: InputMaybe<User_Subscriptions_Aggregate_Order_By>;
};

/** primary key columns input for table: member_types */
export type Member_Types_Pk_Columns_Input = {
  /** 会员类型标识：free, plus, premium */
  id: Scalars['String']['input'];
};

/** select columns of table "member_types" */
export enum Member_Types_Select_Column {
  /** column name */
  AddToMyTankLimit = 'add_to_my_tank_limit',
  /** column name */
  CanGroupChat = 'can_group_chat',
  /** column name */
  CanPromoteOwner = 'can_promote_owner',
  /** column name */
  CanSelfTalk = 'can_self_talk',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DrawFishLimit = 'draw_fish_limit',
  /** column name */
  FeePerMonth = 'fee_per_month',
  /** column name */
  FeePerYear = 'fee_per_year',
  /** column name */
  GroupChatDailyLimit = 'group_chat_daily_limit',
  /** column name */
  Id = 'id',
  /** column name */
  LeadTopicFrequency = 'lead_topic_frequency',
  /** column name */
  Name = 'name',
  /** column name */
  PromoteOwnerFrequency = 'promote_owner_frequency',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "member_types" */
export type Member_Types_Set_Input = {
  add_to_my_tank_limit?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼是否可以参与群聊 */
  can_group_chat?: InputMaybe<Scalars['Boolean']['input']>;
  /** 该会员类型的鱼是否可以宣传主人 */
  can_promote_owner?: InputMaybe<Scalars['Boolean']['input']>;
  /** 该会员类型的鱼是否可以自语 */
  can_self_talk?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  draw_fish_limit?: InputMaybe<Scalars['String']['input']>;
  fee_per_month?: InputMaybe<Scalars['numeric']['input']>;
  fee_per_year?: InputMaybe<Scalars['numeric']['input']>;
  group_chat_daily_limit?: InputMaybe<Scalars['String']['input']>;
  /** 会员类型标识：free, plus, premium */
  id?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: InputMaybe<Scalars['Int']['input']>;
  /** 会员类型名称（显示用） */
  name?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
};

/** aggregate stddev on columns */
export type Member_Types_Stddev_Fields = {
  __typename?: 'member_types_stddev_fields';
  fee_per_month?: Maybe<Scalars['Float']['output']>;
  fee_per_year?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Member_Types_Stddev_Pop_Fields = {
  __typename?: 'member_types_stddev_pop_fields';
  fee_per_month?: Maybe<Scalars['Float']['output']>;
  fee_per_year?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Member_Types_Stddev_Samp_Fields = {
  __typename?: 'member_types_stddev_samp_fields';
  fee_per_month?: Maybe<Scalars['Float']['output']>;
  fee_per_year?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "member_types" */
export type Member_Types_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Member_Types_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Member_Types_Stream_Cursor_Value_Input = {
  add_to_my_tank_limit?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼是否可以参与群聊 */
  can_group_chat?: InputMaybe<Scalars['Boolean']['input']>;
  /** 该会员类型的鱼是否可以宣传主人 */
  can_promote_owner?: InputMaybe<Scalars['Boolean']['input']>;
  /** 该会员类型的鱼是否可以自语 */
  can_self_talk?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  draw_fish_limit?: InputMaybe<Scalars['String']['input']>;
  fee_per_month?: InputMaybe<Scalars['numeric']['input']>;
  fee_per_year?: InputMaybe<Scalars['numeric']['input']>;
  group_chat_daily_limit?: InputMaybe<Scalars['String']['input']>;
  /** 会员类型标识：free, plus, premium */
  id?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: InputMaybe<Scalars['Int']['input']>;
  /** 会员类型名称（显示用） */
  name?: InputMaybe<Scalars['String']['input']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
};

/** aggregate sum on columns */
export type Member_Types_Sum_Fields = {
  __typename?: 'member_types_sum_fields';
  fee_per_month?: Maybe<Scalars['numeric']['output']>;
  fee_per_year?: Maybe<Scalars['numeric']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Int']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "member_types" */
export enum Member_Types_Update_Column {
  /** column name */
  AddToMyTankLimit = 'add_to_my_tank_limit',
  /** column name */
  CanGroupChat = 'can_group_chat',
  /** column name */
  CanPromoteOwner = 'can_promote_owner',
  /** column name */
  CanSelfTalk = 'can_self_talk',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DrawFishLimit = 'draw_fish_limit',
  /** column name */
  FeePerMonth = 'fee_per_month',
  /** column name */
  FeePerYear = 'fee_per_year',
  /** column name */
  GroupChatDailyLimit = 'group_chat_daily_limit',
  /** column name */
  Id = 'id',
  /** column name */
  LeadTopicFrequency = 'lead_topic_frequency',
  /** column name */
  Name = 'name',
  /** column name */
  PromoteOwnerFrequency = 'promote_owner_frequency',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Member_Types_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Member_Types_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Member_Types_Set_Input>;
  /** filter the rows which have to be updated */
  where: Member_Types_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Member_Types_Var_Pop_Fields = {
  __typename?: 'member_types_var_pop_fields';
  fee_per_month?: Maybe<Scalars['Float']['output']>;
  fee_per_year?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Member_Types_Var_Samp_Fields = {
  __typename?: 'member_types_var_samp_fields';
  fee_per_month?: Maybe<Scalars['Float']['output']>;
  fee_per_year?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Member_Types_Variance_Fields = {
  __typename?: 'member_types_variance_fields';
  fee_per_month?: Maybe<Scalars['Float']['output']>;
  fee_per_year?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼主导话题的频率（每小时次数） */
  lead_topic_frequency?: Maybe<Scalars['Float']['output']>;
  /** 该会员类型的鱼宣传主人的频率（每小时次数） */
  promote_owner_frequency?: Maybe<Scalars['Float']['output']>;
};

/** 用户留言表，支持给鱼和鱼主人留言 */
export type Messages = {
  __typename?: 'messages';
  /** 留言内容（1-50字符） */
  content: Scalars['String']['output'];
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** An object relationship */
  fish?: Maybe<Fish>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id: Scalars['uuid']['output'];
  /** 消息是否已读，默认false */
  is_read: Scalars['Boolean']['output'];
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type: Scalars['String']['output'];
  /** 消息被标记为已读的时间戳 */
  read_at?: Maybe<Scalars['timestamp']['output']>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: Maybe<Scalars['String']['output']>;
  /** 发送者用户ID（外键关联users表） */
  sender_id: Scalars['String']['output'];
  /** An object relationship */
  user?: Maybe<Users>;
  /** An object relationship */
  userBySenderId: Users;
  /** 可见性：public=公开，private=私密 */
  visibility?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "messages" */
export type Messages_Aggregate = {
  __typename?: 'messages_aggregate';
  aggregate?: Maybe<Messages_Aggregate_Fields>;
  nodes: Array<Messages>;
};

export type Messages_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Messages_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Messages_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Messages_Aggregate_Bool_Exp_Count>;
};

export type Messages_Aggregate_Bool_Exp_Bool_And = {
  arguments: Messages_Select_Column_Messages_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Messages_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Messages_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Messages_Select_Column_Messages_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Messages_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Messages_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Messages_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Messages_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "messages" */
export type Messages_Aggregate_Fields = {
  __typename?: 'messages_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Messages_Max_Fields>;
  min?: Maybe<Messages_Min_Fields>;
};


/** aggregate fields of "messages" */
export type Messages_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Messages_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "messages" */
export type Messages_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Messages_Max_Order_By>;
  min?: InputMaybe<Messages_Min_Order_By>;
};

/** input type for inserting array relation for remote table "messages" */
export type Messages_Arr_Rel_Insert_Input = {
  data: Array<Messages_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Messages_On_Conflict>;
};

/** Boolean expression to filter rows from the table "messages". All fields are combined with a logical 'AND'. */
export type Messages_Bool_Exp = {
  _and?: InputMaybe<Array<Messages_Bool_Exp>>;
  _not?: InputMaybe<Messages_Bool_Exp>;
  _or?: InputMaybe<Array<Messages_Bool_Exp>>;
  content?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish?: InputMaybe<Fish_Bool_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_read?: InputMaybe<Boolean_Comparison_Exp>;
  message_type?: InputMaybe<String_Comparison_Exp>;
  read_at?: InputMaybe<Timestamp_Comparison_Exp>;
  receiver_id?: InputMaybe<String_Comparison_Exp>;
  sender_id?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userBySenderId?: InputMaybe<Users_Bool_Exp>;
  visibility?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "messages" */
export enum Messages_Constraint {
  /** unique or primary key constraint on columns "id" */
  MessagesPkey = 'messages_pkey'
}

/** input type for inserting data into table "messages" */
export type Messages_Insert_Input = {
  /** 留言内容（1-50字符） */
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish?: InputMaybe<Fish_Obj_Rel_Insert_Input>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 消息是否已读，默认false */
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type?: InputMaybe<Scalars['String']['input']>;
  /** 消息被标记为已读的时间戳 */
  read_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  /** 发送者用户ID（外键关联users表） */
  sender_id?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userBySenderId?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  /** 可见性：public=公开，private=私密 */
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Messages_Max_Fields = {
  __typename?: 'messages_max_fields';
  /** 留言内容（1-50字符） */
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type?: Maybe<Scalars['String']['output']>;
  /** 消息被标记为已读的时间戳 */
  read_at?: Maybe<Scalars['timestamp']['output']>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: Maybe<Scalars['String']['output']>;
  /** 发送者用户ID（外键关联users表） */
  sender_id?: Maybe<Scalars['String']['output']>;
  /** 可见性：public=公开，private=私密 */
  visibility?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "messages" */
export type Messages_Max_Order_By = {
  /** 留言内容（1-50字符） */
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type?: InputMaybe<Order_By>;
  /** 消息被标记为已读的时间戳 */
  read_at?: InputMaybe<Order_By>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: InputMaybe<Order_By>;
  /** 发送者用户ID（外键关联users表） */
  sender_id?: InputMaybe<Order_By>;
  /** 可见性：public=公开，private=私密 */
  visibility?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Messages_Min_Fields = {
  __typename?: 'messages_min_fields';
  /** 留言内容（1-50字符） */
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type?: Maybe<Scalars['String']['output']>;
  /** 消息被标记为已读的时间戳 */
  read_at?: Maybe<Scalars['timestamp']['output']>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: Maybe<Scalars['String']['output']>;
  /** 发送者用户ID（外键关联users表） */
  sender_id?: Maybe<Scalars['String']['output']>;
  /** 可见性：public=公开，private=私密 */
  visibility?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "messages" */
export type Messages_Min_Order_By = {
  /** 留言内容（1-50字符） */
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type?: InputMaybe<Order_By>;
  /** 消息被标记为已读的时间戳 */
  read_at?: InputMaybe<Order_By>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: InputMaybe<Order_By>;
  /** 发送者用户ID（外键关联users表） */
  sender_id?: InputMaybe<Order_By>;
  /** 可见性：public=公开，private=私密 */
  visibility?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "messages" */
export type Messages_Mutation_Response = {
  __typename?: 'messages_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Messages>;
};

/** on_conflict condition type for table "messages" */
export type Messages_On_Conflict = {
  constraint: Messages_Constraint;
  update_columns?: Array<Messages_Update_Column>;
  where?: InputMaybe<Messages_Bool_Exp>;
};

/** Ordering options when selecting data from "messages". */
export type Messages_Order_By = {
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish?: InputMaybe<Fish_Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_read?: InputMaybe<Order_By>;
  message_type?: InputMaybe<Order_By>;
  read_at?: InputMaybe<Order_By>;
  receiver_id?: InputMaybe<Order_By>;
  sender_id?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  userBySenderId?: InputMaybe<Users_Order_By>;
  visibility?: InputMaybe<Order_By>;
};

/** primary key columns input for table: messages */
export type Messages_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "messages" */
export enum Messages_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsRead = 'is_read',
  /** column name */
  MessageType = 'message_type',
  /** column name */
  ReadAt = 'read_at',
  /** column name */
  ReceiverId = 'receiver_id',
  /** column name */
  SenderId = 'sender_id',
  /** column name */
  Visibility = 'visibility'
}

/** select "messages_aggregate_bool_exp_bool_and_arguments_columns" columns of table "messages" */
export enum Messages_Select_Column_Messages_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsRead = 'is_read'
}

/** select "messages_aggregate_bool_exp_bool_or_arguments_columns" columns of table "messages" */
export enum Messages_Select_Column_Messages_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsRead = 'is_read'
}

/** input type for updating data in table "messages" */
export type Messages_Set_Input = {
  /** 留言内容（1-50字符） */
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 消息是否已读，默认false */
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type?: InputMaybe<Scalars['String']['input']>;
  /** 消息被标记为已读的时间戳 */
  read_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  /** 发送者用户ID（外键关联users表） */
  sender_id?: InputMaybe<Scalars['String']['input']>;
  /** 可见性：public=公开，private=私密 */
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "messages" */
export type Messages_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Messages_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Messages_Stream_Cursor_Value_Input = {
  /** 留言内容（1-50字符） */
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 目标鱼ID（留言给鱼时使用） */
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 消息是否已读，默认false */
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  /** 留言类型：to_fish=给鱼留言，to_owner=给主人留言 */
  message_type?: InputMaybe<Scalars['String']['input']>;
  /** 消息被标记为已读的时间戳 */
  read_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 接收者用户ID（留言给主人时使用） */
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  /** 发送者用户ID（外键关联users表） */
  sender_id?: InputMaybe<Scalars['String']['input']>;
  /** 可见性：public=公开，private=私密 */
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "messages" */
export enum Messages_Update_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsRead = 'is_read',
  /** column name */
  MessageType = 'message_type',
  /** column name */
  ReadAt = 'read_at',
  /** column name */
  ReceiverId = 'receiver_id',
  /** column name */
  SenderId = 'sender_id',
  /** column name */
  Visibility = 'visibility'
}

export type Messages_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Messages_Set_Input>;
  /** filter the rows which have to be updated */
  where: Messages_Bool_Exp;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "conversations" */
  delete_conversations?: Maybe<Conversations_Mutation_Response>;
  /** delete single row from the table: "conversations" */
  delete_conversations_by_pk?: Maybe<Conversations>;
  /** delete data from the table: "fish" */
  delete_fish?: Maybe<Fish_Mutation_Response>;
  /** delete single row from the table: "fish" */
  delete_fish_by_pk?: Maybe<Fish>;
  /** delete data from the table: "fish_favorites" */
  delete_fish_favorites?: Maybe<Fish_Favorites_Mutation_Response>;
  /** delete single row from the table: "fish_favorites" */
  delete_fish_favorites_by_pk?: Maybe<Fish_Favorites>;
  /** delete data from the table: "fish_monologues" */
  delete_fish_monologues?: Maybe<Fish_Monologues_Mutation_Response>;
  /** delete single row from the table: "fish_monologues" */
  delete_fish_monologues_by_pk?: Maybe<Fish_Monologues>;
  /** delete data from the table: "fish_personalities" */
  delete_fish_personalities?: Maybe<Fish_Personalities_Mutation_Response>;
  /** delete single row from the table: "fish_personalities" */
  delete_fish_personalities_by_pk?: Maybe<Fish_Personalities>;
  /** delete data from the table: "global_params" */
  delete_global_params?: Maybe<Global_Params_Mutation_Response>;
  /** delete single row from the table: "global_params" */
  delete_global_params_by_pk?: Maybe<Global_Params>;
  /** delete data from the table: "group_chat" */
  delete_group_chat?: Maybe<Group_Chat_Mutation_Response>;
  /** delete single row from the table: "group_chat" */
  delete_group_chat_by_pk?: Maybe<Group_Chat>;
  /** delete data from the table: "member_types" */
  delete_member_types?: Maybe<Member_Types_Mutation_Response>;
  /** delete single row from the table: "member_types" */
  delete_member_types_by_pk?: Maybe<Member_Types>;
  /** delete data from the table: "messages" */
  delete_messages?: Maybe<Messages_Mutation_Response>;
  /** delete single row from the table: "messages" */
  delete_messages_by_pk?: Maybe<Messages>;
  /** delete data from the table: "public_messages_view" */
  delete_public_messages_view?: Maybe<Public_Messages_View_Mutation_Response>;
  /** delete data from the table: "recent_chat_sessions" */
  delete_recent_chat_sessions?: Maybe<Recent_Chat_Sessions_Mutation_Response>;
  /** delete data from the table: "reports" */
  delete_reports?: Maybe<Reports_Mutation_Response>;
  /** delete single row from the table: "reports" */
  delete_reports_by_pk?: Maybe<Reports>;
  /** delete data from the table: "user_subscriptions" */
  delete_user_subscriptions?: Maybe<User_Subscriptions_Mutation_Response>;
  /** delete single row from the table: "user_subscriptions" */
  delete_user_subscriptions_by_pk?: Maybe<User_Subscriptions>;
  /** delete data from the table: "user_visible_messages_view" */
  delete_user_visible_messages_view?: Maybe<User_Visible_Messages_View_Mutation_Response>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** delete data from the table: "votes" */
  delete_votes?: Maybe<Votes_Mutation_Response>;
  /** delete single row from the table: "votes" */
  delete_votes_by_pk?: Maybe<Votes>;
  /** insert data into the table: "conversations" */
  insert_conversations?: Maybe<Conversations_Mutation_Response>;
  /** insert a single row into the table: "conversations" */
  insert_conversations_one?: Maybe<Conversations>;
  /** insert data into the table: "fish" */
  insert_fish?: Maybe<Fish_Mutation_Response>;
  /** insert data into the table: "fish_favorites" */
  insert_fish_favorites?: Maybe<Fish_Favorites_Mutation_Response>;
  /** insert a single row into the table: "fish_favorites" */
  insert_fish_favorites_one?: Maybe<Fish_Favorites>;
  /** insert data into the table: "fish_monologues" */
  insert_fish_monologues?: Maybe<Fish_Monologues_Mutation_Response>;
  /** insert a single row into the table: "fish_monologues" */
  insert_fish_monologues_one?: Maybe<Fish_Monologues>;
  /** insert a single row into the table: "fish" */
  insert_fish_one?: Maybe<Fish>;
  /** insert data into the table: "fish_personalities" */
  insert_fish_personalities?: Maybe<Fish_Personalities_Mutation_Response>;
  /** insert a single row into the table: "fish_personalities" */
  insert_fish_personalities_one?: Maybe<Fish_Personalities>;
  /** insert data into the table: "global_params" */
  insert_global_params?: Maybe<Global_Params_Mutation_Response>;
  /** insert a single row into the table: "global_params" */
  insert_global_params_one?: Maybe<Global_Params>;
  /** insert data into the table: "group_chat" */
  insert_group_chat?: Maybe<Group_Chat_Mutation_Response>;
  /** insert a single row into the table: "group_chat" */
  insert_group_chat_one?: Maybe<Group_Chat>;
  /** insert data into the table: "member_types" */
  insert_member_types?: Maybe<Member_Types_Mutation_Response>;
  /** insert a single row into the table: "member_types" */
  insert_member_types_one?: Maybe<Member_Types>;
  /** insert data into the table: "messages" */
  insert_messages?: Maybe<Messages_Mutation_Response>;
  /** insert a single row into the table: "messages" */
  insert_messages_one?: Maybe<Messages>;
  /** insert data into the table: "public_messages_view" */
  insert_public_messages_view?: Maybe<Public_Messages_View_Mutation_Response>;
  /** insert a single row into the table: "public_messages_view" */
  insert_public_messages_view_one?: Maybe<Public_Messages_View>;
  /** insert data into the table: "recent_chat_sessions" */
  insert_recent_chat_sessions?: Maybe<Recent_Chat_Sessions_Mutation_Response>;
  /** insert a single row into the table: "recent_chat_sessions" */
  insert_recent_chat_sessions_one?: Maybe<Recent_Chat_Sessions>;
  /** insert data into the table: "reports" */
  insert_reports?: Maybe<Reports_Mutation_Response>;
  /** insert a single row into the table: "reports" */
  insert_reports_one?: Maybe<Reports>;
  /** insert data into the table: "user_subscriptions" */
  insert_user_subscriptions?: Maybe<User_Subscriptions_Mutation_Response>;
  /** insert a single row into the table: "user_subscriptions" */
  insert_user_subscriptions_one?: Maybe<User_Subscriptions>;
  /** insert data into the table: "user_visible_messages_view" */
  insert_user_visible_messages_view?: Maybe<User_Visible_Messages_View_Mutation_Response>;
  /** insert a single row into the table: "user_visible_messages_view" */
  insert_user_visible_messages_view_one?: Maybe<User_Visible_Messages_View>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** insert data into the table: "votes" */
  insert_votes?: Maybe<Votes_Mutation_Response>;
  /** insert a single row into the table: "votes" */
  insert_votes_one?: Maybe<Votes>;
  /** update data of the table: "conversations" */
  update_conversations?: Maybe<Conversations_Mutation_Response>;
  /** update single row of the table: "conversations" */
  update_conversations_by_pk?: Maybe<Conversations>;
  /** update multiples rows of table: "conversations" */
  update_conversations_many?: Maybe<Array<Maybe<Conversations_Mutation_Response>>>;
  /** update data of the table: "fish" */
  update_fish?: Maybe<Fish_Mutation_Response>;
  /** update single row of the table: "fish" */
  update_fish_by_pk?: Maybe<Fish>;
  /** update data of the table: "fish_favorites" */
  update_fish_favorites?: Maybe<Fish_Favorites_Mutation_Response>;
  /** update single row of the table: "fish_favorites" */
  update_fish_favorites_by_pk?: Maybe<Fish_Favorites>;
  /** update multiples rows of table: "fish_favorites" */
  update_fish_favorites_many?: Maybe<Array<Maybe<Fish_Favorites_Mutation_Response>>>;
  /** update multiples rows of table: "fish" */
  update_fish_many?: Maybe<Array<Maybe<Fish_Mutation_Response>>>;
  /** update data of the table: "fish_monologues" */
  update_fish_monologues?: Maybe<Fish_Monologues_Mutation_Response>;
  /** update single row of the table: "fish_monologues" */
  update_fish_monologues_by_pk?: Maybe<Fish_Monologues>;
  /** update multiples rows of table: "fish_monologues" */
  update_fish_monologues_many?: Maybe<Array<Maybe<Fish_Monologues_Mutation_Response>>>;
  /** update data of the table: "fish_personalities" */
  update_fish_personalities?: Maybe<Fish_Personalities_Mutation_Response>;
  /** update single row of the table: "fish_personalities" */
  update_fish_personalities_by_pk?: Maybe<Fish_Personalities>;
  /** update multiples rows of table: "fish_personalities" */
  update_fish_personalities_many?: Maybe<Array<Maybe<Fish_Personalities_Mutation_Response>>>;
  /** update data of the table: "global_params" */
  update_global_params?: Maybe<Global_Params_Mutation_Response>;
  /** update single row of the table: "global_params" */
  update_global_params_by_pk?: Maybe<Global_Params>;
  /** update multiples rows of table: "global_params" */
  update_global_params_many?: Maybe<Array<Maybe<Global_Params_Mutation_Response>>>;
  /** update data of the table: "group_chat" */
  update_group_chat?: Maybe<Group_Chat_Mutation_Response>;
  /** update single row of the table: "group_chat" */
  update_group_chat_by_pk?: Maybe<Group_Chat>;
  /** update multiples rows of table: "group_chat" */
  update_group_chat_many?: Maybe<Array<Maybe<Group_Chat_Mutation_Response>>>;
  /** update data of the table: "member_types" */
  update_member_types?: Maybe<Member_Types_Mutation_Response>;
  /** update single row of the table: "member_types" */
  update_member_types_by_pk?: Maybe<Member_Types>;
  /** update multiples rows of table: "member_types" */
  update_member_types_many?: Maybe<Array<Maybe<Member_Types_Mutation_Response>>>;
  /** update data of the table: "messages" */
  update_messages?: Maybe<Messages_Mutation_Response>;
  /** update single row of the table: "messages" */
  update_messages_by_pk?: Maybe<Messages>;
  /** update multiples rows of table: "messages" */
  update_messages_many?: Maybe<Array<Maybe<Messages_Mutation_Response>>>;
  /** update data of the table: "public_messages_view" */
  update_public_messages_view?: Maybe<Public_Messages_View_Mutation_Response>;
  /** update multiples rows of table: "public_messages_view" */
  update_public_messages_view_many?: Maybe<Array<Maybe<Public_Messages_View_Mutation_Response>>>;
  /** update data of the table: "recent_chat_sessions" */
  update_recent_chat_sessions?: Maybe<Recent_Chat_Sessions_Mutation_Response>;
  /** update multiples rows of table: "recent_chat_sessions" */
  update_recent_chat_sessions_many?: Maybe<Array<Maybe<Recent_Chat_Sessions_Mutation_Response>>>;
  /** update data of the table: "reports" */
  update_reports?: Maybe<Reports_Mutation_Response>;
  /** update single row of the table: "reports" */
  update_reports_by_pk?: Maybe<Reports>;
  /** update multiples rows of table: "reports" */
  update_reports_many?: Maybe<Array<Maybe<Reports_Mutation_Response>>>;
  /** update data of the table: "user_subscriptions" */
  update_user_subscriptions?: Maybe<User_Subscriptions_Mutation_Response>;
  /** update single row of the table: "user_subscriptions" */
  update_user_subscriptions_by_pk?: Maybe<User_Subscriptions>;
  /** update multiples rows of table: "user_subscriptions" */
  update_user_subscriptions_many?: Maybe<Array<Maybe<User_Subscriptions_Mutation_Response>>>;
  /** update data of the table: "user_visible_messages_view" */
  update_user_visible_messages_view?: Maybe<User_Visible_Messages_View_Mutation_Response>;
  /** update multiples rows of table: "user_visible_messages_view" */
  update_user_visible_messages_view_many?: Maybe<Array<Maybe<User_Visible_Messages_View_Mutation_Response>>>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "users" */
  update_users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
  /** update data of the table: "votes" */
  update_votes?: Maybe<Votes_Mutation_Response>;
  /** update single row of the table: "votes" */
  update_votes_by_pk?: Maybe<Votes>;
  /** update multiples rows of table: "votes" */
  update_votes_many?: Maybe<Array<Maybe<Votes_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_ConversationsArgs = {
  where: Conversations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Conversations_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_FishArgs = {
  where: Fish_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Fish_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Fish_FavoritesArgs = {
  where: Fish_Favorites_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Fish_Favorites_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Fish_MonologuesArgs = {
  where: Fish_Monologues_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Fish_Monologues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Fish_PersonalitiesArgs = {
  where: Fish_Personalities_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Fish_Personalities_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Global_ParamsArgs = {
  where: Global_Params_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Global_Params_By_PkArgs = {
  key: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Group_ChatArgs = {
  where: Group_Chat_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Group_Chat_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Member_TypesArgs = {
  where: Member_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Member_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_MessagesArgs = {
  where: Messages_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Messages_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Public_Messages_ViewArgs = {
  where: Public_Messages_View_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Recent_Chat_SessionsArgs = {
  where: Recent_Chat_Sessions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_ReportsArgs = {
  where: Reports_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Reports_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_SubscriptionsArgs = {
  where: User_Subscriptions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Subscriptions_By_PkArgs = {
  id: Scalars['Int']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_Visible_Messages_ViewArgs = {
  where: User_Visible_Messages_View_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_VotesArgs = {
  where: Votes_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Votes_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_ConversationsArgs = {
  objects: Array<Conversations_Insert_Input>;
  on_conflict?: InputMaybe<Conversations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Conversations_OneArgs = {
  object: Conversations_Insert_Input;
  on_conflict?: InputMaybe<Conversations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_FishArgs = {
  objects: Array<Fish_Insert_Input>;
  on_conflict?: InputMaybe<Fish_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_FavoritesArgs = {
  objects: Array<Fish_Favorites_Insert_Input>;
  on_conflict?: InputMaybe<Fish_Favorites_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_Favorites_OneArgs = {
  object: Fish_Favorites_Insert_Input;
  on_conflict?: InputMaybe<Fish_Favorites_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_MonologuesArgs = {
  objects: Array<Fish_Monologues_Insert_Input>;
  on_conflict?: InputMaybe<Fish_Monologues_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_Monologues_OneArgs = {
  object: Fish_Monologues_Insert_Input;
  on_conflict?: InputMaybe<Fish_Monologues_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_OneArgs = {
  object: Fish_Insert_Input;
  on_conflict?: InputMaybe<Fish_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_PersonalitiesArgs = {
  objects: Array<Fish_Personalities_Insert_Input>;
  on_conflict?: InputMaybe<Fish_Personalities_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_Personalities_OneArgs = {
  object: Fish_Personalities_Insert_Input;
  on_conflict?: InputMaybe<Fish_Personalities_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Global_ParamsArgs = {
  objects: Array<Global_Params_Insert_Input>;
  on_conflict?: InputMaybe<Global_Params_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Global_Params_OneArgs = {
  object: Global_Params_Insert_Input;
  on_conflict?: InputMaybe<Global_Params_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Group_ChatArgs = {
  objects: Array<Group_Chat_Insert_Input>;
  on_conflict?: InputMaybe<Group_Chat_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Group_Chat_OneArgs = {
  object: Group_Chat_Insert_Input;
  on_conflict?: InputMaybe<Group_Chat_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Member_TypesArgs = {
  objects: Array<Member_Types_Insert_Input>;
  on_conflict?: InputMaybe<Member_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Member_Types_OneArgs = {
  object: Member_Types_Insert_Input;
  on_conflict?: InputMaybe<Member_Types_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_MessagesArgs = {
  objects: Array<Messages_Insert_Input>;
  on_conflict?: InputMaybe<Messages_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Messages_OneArgs = {
  object: Messages_Insert_Input;
  on_conflict?: InputMaybe<Messages_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Public_Messages_ViewArgs = {
  objects: Array<Public_Messages_View_Insert_Input>;
};


/** mutation root */
export type Mutation_RootInsert_Public_Messages_View_OneArgs = {
  object: Public_Messages_View_Insert_Input;
};


/** mutation root */
export type Mutation_RootInsert_Recent_Chat_SessionsArgs = {
  objects: Array<Recent_Chat_Sessions_Insert_Input>;
};


/** mutation root */
export type Mutation_RootInsert_Recent_Chat_Sessions_OneArgs = {
  object: Recent_Chat_Sessions_Insert_Input;
};


/** mutation root */
export type Mutation_RootInsert_ReportsArgs = {
  objects: Array<Reports_Insert_Input>;
  on_conflict?: InputMaybe<Reports_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Reports_OneArgs = {
  object: Reports_Insert_Input;
  on_conflict?: InputMaybe<Reports_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_SubscriptionsArgs = {
  objects: Array<User_Subscriptions_Insert_Input>;
  on_conflict?: InputMaybe<User_Subscriptions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Subscriptions_OneArgs = {
  object: User_Subscriptions_Insert_Input;
  on_conflict?: InputMaybe<User_Subscriptions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Visible_Messages_ViewArgs = {
  objects: Array<User_Visible_Messages_View_Insert_Input>;
};


/** mutation root */
export type Mutation_RootInsert_User_Visible_Messages_View_OneArgs = {
  object: User_Visible_Messages_View_Insert_Input;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_VotesArgs = {
  objects: Array<Votes_Insert_Input>;
  on_conflict?: InputMaybe<Votes_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Votes_OneArgs = {
  object: Votes_Insert_Input;
  on_conflict?: InputMaybe<Votes_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_ConversationsArgs = {
  _inc?: InputMaybe<Conversations_Inc_Input>;
  _set?: InputMaybe<Conversations_Set_Input>;
  where: Conversations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Conversations_By_PkArgs = {
  _inc?: InputMaybe<Conversations_Inc_Input>;
  _set?: InputMaybe<Conversations_Set_Input>;
  pk_columns: Conversations_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Conversations_ManyArgs = {
  updates: Array<Conversations_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_FishArgs = {
  _inc?: InputMaybe<Fish_Inc_Input>;
  _set?: InputMaybe<Fish_Set_Input>;
  where: Fish_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_By_PkArgs = {
  _inc?: InputMaybe<Fish_Inc_Input>;
  _set?: InputMaybe<Fish_Set_Input>;
  pk_columns: Fish_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_FavoritesArgs = {
  _set?: InputMaybe<Fish_Favorites_Set_Input>;
  where: Fish_Favorites_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Favorites_By_PkArgs = {
  _set?: InputMaybe<Fish_Favorites_Set_Input>;
  pk_columns: Fish_Favorites_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Favorites_ManyArgs = {
  updates: Array<Fish_Favorites_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_ManyArgs = {
  updates: Array<Fish_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_MonologuesArgs = {
  _set?: InputMaybe<Fish_Monologues_Set_Input>;
  where: Fish_Monologues_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Monologues_By_PkArgs = {
  _set?: InputMaybe<Fish_Monologues_Set_Input>;
  pk_columns: Fish_Monologues_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Monologues_ManyArgs = {
  updates: Array<Fish_Monologues_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_PersonalitiesArgs = {
  _inc?: InputMaybe<Fish_Personalities_Inc_Input>;
  _set?: InputMaybe<Fish_Personalities_Set_Input>;
  where: Fish_Personalities_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Personalities_By_PkArgs = {
  _inc?: InputMaybe<Fish_Personalities_Inc_Input>;
  _set?: InputMaybe<Fish_Personalities_Set_Input>;
  pk_columns: Fish_Personalities_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Personalities_ManyArgs = {
  updates: Array<Fish_Personalities_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Global_ParamsArgs = {
  _set?: InputMaybe<Global_Params_Set_Input>;
  where: Global_Params_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Global_Params_By_PkArgs = {
  _set?: InputMaybe<Global_Params_Set_Input>;
  pk_columns: Global_Params_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Global_Params_ManyArgs = {
  updates: Array<Global_Params_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Group_ChatArgs = {
  _append?: InputMaybe<Group_Chat_Append_Input>;
  _delete_at_path?: InputMaybe<Group_Chat_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Group_Chat_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Group_Chat_Delete_Key_Input>;
  _inc?: InputMaybe<Group_Chat_Inc_Input>;
  _prepend?: InputMaybe<Group_Chat_Prepend_Input>;
  _set?: InputMaybe<Group_Chat_Set_Input>;
  where: Group_Chat_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Group_Chat_By_PkArgs = {
  _append?: InputMaybe<Group_Chat_Append_Input>;
  _delete_at_path?: InputMaybe<Group_Chat_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Group_Chat_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Group_Chat_Delete_Key_Input>;
  _inc?: InputMaybe<Group_Chat_Inc_Input>;
  _prepend?: InputMaybe<Group_Chat_Prepend_Input>;
  _set?: InputMaybe<Group_Chat_Set_Input>;
  pk_columns: Group_Chat_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Group_Chat_ManyArgs = {
  updates: Array<Group_Chat_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Member_TypesArgs = {
  _inc?: InputMaybe<Member_Types_Inc_Input>;
  _set?: InputMaybe<Member_Types_Set_Input>;
  where: Member_Types_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Member_Types_By_PkArgs = {
  _inc?: InputMaybe<Member_Types_Inc_Input>;
  _set?: InputMaybe<Member_Types_Set_Input>;
  pk_columns: Member_Types_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Member_Types_ManyArgs = {
  updates: Array<Member_Types_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_MessagesArgs = {
  _set?: InputMaybe<Messages_Set_Input>;
  where: Messages_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Messages_By_PkArgs = {
  _set?: InputMaybe<Messages_Set_Input>;
  pk_columns: Messages_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Messages_ManyArgs = {
  updates: Array<Messages_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Public_Messages_ViewArgs = {
  _set?: InputMaybe<Public_Messages_View_Set_Input>;
  where: Public_Messages_View_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Public_Messages_View_ManyArgs = {
  updates: Array<Public_Messages_View_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Recent_Chat_SessionsArgs = {
  _inc?: InputMaybe<Recent_Chat_Sessions_Inc_Input>;
  _set?: InputMaybe<Recent_Chat_Sessions_Set_Input>;
  where: Recent_Chat_Sessions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Recent_Chat_Sessions_ManyArgs = {
  updates: Array<Recent_Chat_Sessions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ReportsArgs = {
  _set?: InputMaybe<Reports_Set_Input>;
  where: Reports_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Reports_By_PkArgs = {
  _set?: InputMaybe<Reports_Set_Input>;
  pk_columns: Reports_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Reports_ManyArgs = {
  updates: Array<Reports_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_SubscriptionsArgs = {
  _inc?: InputMaybe<User_Subscriptions_Inc_Input>;
  _set?: InputMaybe<User_Subscriptions_Set_Input>;
  where: User_Subscriptions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Subscriptions_By_PkArgs = {
  _inc?: InputMaybe<User_Subscriptions_Inc_Input>;
  _set?: InputMaybe<User_Subscriptions_Set_Input>;
  pk_columns: User_Subscriptions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Subscriptions_ManyArgs = {
  updates: Array<User_Subscriptions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_Visible_Messages_ViewArgs = {
  _set?: InputMaybe<User_Visible_Messages_View_Set_Input>;
  where: User_Visible_Messages_View_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Visible_Messages_View_ManyArgs = {
  updates: Array<User_Visible_Messages_View_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_VotesArgs = {
  _set?: InputMaybe<Votes_Set_Input>;
  where: Votes_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Votes_By_PkArgs = {
  _set?: InputMaybe<Votes_Set_Input>;
  pk_columns: Votes_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Votes_ManyArgs = {
  updates: Array<Votes_Updates>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** columns and relationships of "public_messages_view" */
export type Public_Messages_View = {
  __typename?: 'public_messages_view';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_type?: Maybe<Scalars['String']['output']>;
  receiver_id?: Maybe<Scalars['String']['output']>;
  sender_id?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "public_messages_view" */
export type Public_Messages_View_Aggregate = {
  __typename?: 'public_messages_view_aggregate';
  aggregate?: Maybe<Public_Messages_View_Aggregate_Fields>;
  nodes: Array<Public_Messages_View>;
};

/** aggregate fields of "public_messages_view" */
export type Public_Messages_View_Aggregate_Fields = {
  __typename?: 'public_messages_view_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Public_Messages_View_Max_Fields>;
  min?: Maybe<Public_Messages_View_Min_Fields>;
};


/** aggregate fields of "public_messages_view" */
export type Public_Messages_View_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Public_Messages_View_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "public_messages_view". All fields are combined with a logical 'AND'. */
export type Public_Messages_View_Bool_Exp = {
  _and?: InputMaybe<Array<Public_Messages_View_Bool_Exp>>;
  _not?: InputMaybe<Public_Messages_View_Bool_Exp>;
  _or?: InputMaybe<Array<Public_Messages_View_Bool_Exp>>;
  content?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  message_type?: InputMaybe<String_Comparison_Exp>;
  receiver_id?: InputMaybe<String_Comparison_Exp>;
  sender_id?: InputMaybe<String_Comparison_Exp>;
  visibility?: InputMaybe<String_Comparison_Exp>;
};

/** input type for inserting data into table "public_messages_view" */
export type Public_Messages_View_Insert_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_type?: InputMaybe<Scalars['String']['input']>;
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  sender_id?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Public_Messages_View_Max_Fields = {
  __typename?: 'public_messages_view_max_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_type?: Maybe<Scalars['String']['output']>;
  receiver_id?: Maybe<Scalars['String']['output']>;
  sender_id?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Public_Messages_View_Min_Fields = {
  __typename?: 'public_messages_view_min_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_type?: Maybe<Scalars['String']['output']>;
  receiver_id?: Maybe<Scalars['String']['output']>;
  sender_id?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "public_messages_view" */
export type Public_Messages_View_Mutation_Response = {
  __typename?: 'public_messages_view_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Public_Messages_View>;
};

/** Ordering options when selecting data from "public_messages_view". */
export type Public_Messages_View_Order_By = {
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message_type?: InputMaybe<Order_By>;
  receiver_id?: InputMaybe<Order_By>;
  sender_id?: InputMaybe<Order_By>;
  visibility?: InputMaybe<Order_By>;
};

/** select columns of table "public_messages_view" */
export enum Public_Messages_View_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  MessageType = 'message_type',
  /** column name */
  ReceiverId = 'receiver_id',
  /** column name */
  SenderId = 'sender_id',
  /** column name */
  Visibility = 'visibility'
}

/** input type for updating data in table "public_messages_view" */
export type Public_Messages_View_Set_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_type?: InputMaybe<Scalars['String']['input']>;
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  sender_id?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "public_messages_view" */
export type Public_Messages_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Public_Messages_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Public_Messages_View_Stream_Cursor_Value_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_type?: InputMaybe<Scalars['String']['input']>;
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  sender_id?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

export type Public_Messages_View_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Public_Messages_View_Set_Input>;
  /** filter the rows which have to be updated */
  where: Public_Messages_View_Bool_Exp;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "conversations" */
  conversations: Array<Conversations>;
  /** fetch aggregated fields from the table: "conversations" */
  conversations_aggregate: Conversations_Aggregate;
  /** fetch data from the table: "conversations" using primary key columns */
  conversations_by_pk?: Maybe<Conversations>;
  /** fetch data from the table: "fish" */
  fish: Array<Fish>;
  /** fetch aggregated fields from the table: "fish" */
  fish_aggregate: Fish_Aggregate;
  /** fetch data from the table: "fish" using primary key columns */
  fish_by_pk?: Maybe<Fish>;
  /** An array relationship */
  fish_favorites: Array<Fish_Favorites>;
  /** An aggregate relationship */
  fish_favorites_aggregate: Fish_Favorites_Aggregate;
  /** fetch data from the table: "fish_favorites" using primary key columns */
  fish_favorites_by_pk?: Maybe<Fish_Favorites>;
  /** An array relationship */
  fish_monologues: Array<Fish_Monologues>;
  /** An aggregate relationship */
  fish_monologues_aggregate: Fish_Monologues_Aggregate;
  /** fetch data from the table: "fish_monologues" using primary key columns */
  fish_monologues_by_pk?: Maybe<Fish_Monologues>;
  /** fetch data from the table: "fish_personalities" */
  fish_personalities: Array<Fish_Personalities>;
  /** fetch aggregated fields from the table: "fish_personalities" */
  fish_personalities_aggregate: Fish_Personalities_Aggregate;
  /** fetch data from the table: "fish_personalities" using primary key columns */
  fish_personalities_by_pk?: Maybe<Fish_Personalities>;
  /** fetch data from the table: "global_params" */
  global_params: Array<Global_Params>;
  /** fetch aggregated fields from the table: "global_params" */
  global_params_aggregate: Global_Params_Aggregate;
  /** fetch data from the table: "global_params" using primary key columns */
  global_params_by_pk?: Maybe<Global_Params>;
  /** An array relationship */
  group_chat: Array<Group_Chat>;
  /** An aggregate relationship */
  group_chat_aggregate: Group_Chat_Aggregate;
  /** fetch data from the table: "group_chat" using primary key columns */
  group_chat_by_pk?: Maybe<Group_Chat>;
  /** fetch data from the table: "member_types" */
  member_types: Array<Member_Types>;
  /** fetch aggregated fields from the table: "member_types" */
  member_types_aggregate: Member_Types_Aggregate;
  /** fetch data from the table: "member_types" using primary key columns */
  member_types_by_pk?: Maybe<Member_Types>;
  /** An array relationship */
  messages: Array<Messages>;
  /** An aggregate relationship */
  messages_aggregate: Messages_Aggregate;
  /** fetch data from the table: "messages" using primary key columns */
  messages_by_pk?: Maybe<Messages>;
  /** fetch data from the table: "public_messages_view" */
  public_messages_view: Array<Public_Messages_View>;
  /** fetch aggregated fields from the table: "public_messages_view" */
  public_messages_view_aggregate: Public_Messages_View_Aggregate;
  /** fetch data from the table: "recent_chat_sessions" */
  recent_chat_sessions: Array<Recent_Chat_Sessions>;
  /** fetch aggregated fields from the table: "recent_chat_sessions" */
  recent_chat_sessions_aggregate: Recent_Chat_Sessions_Aggregate;
  /** An array relationship */
  reports: Array<Reports>;
  /** An aggregate relationship */
  reports_aggregate: Reports_Aggregate;
  /** fetch data from the table: "reports" using primary key columns */
  reports_by_pk?: Maybe<Reports>;
  /** An array relationship */
  user_subscriptions: Array<User_Subscriptions>;
  /** An aggregate relationship */
  user_subscriptions_aggregate: User_Subscriptions_Aggregate;
  /** fetch data from the table: "user_subscriptions" using primary key columns */
  user_subscriptions_by_pk?: Maybe<User_Subscriptions>;
  /** fetch data from the table: "user_visible_messages_view" */
  user_visible_messages_view: Array<User_Visible_Messages_View>;
  /** fetch aggregated fields from the table: "user_visible_messages_view" */
  user_visible_messages_view_aggregate: User_Visible_Messages_View_Aggregate;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** An array relationship */
  votes: Array<Votes>;
  /** An aggregate relationship */
  votes_aggregate: Votes_Aggregate;
  /** fetch data from the table: "votes" using primary key columns */
  votes_by_pk?: Maybe<Votes>;
};


export type Query_RootConversationsArgs = {
  distinct_on?: InputMaybe<Array<Conversations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Conversations_Order_By>>;
  where?: InputMaybe<Conversations_Bool_Exp>;
};


export type Query_RootConversations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Conversations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Conversations_Order_By>>;
  where?: InputMaybe<Conversations_Bool_Exp>;
};


export type Query_RootConversations_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootFishArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


export type Query_RootFish_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


export type Query_RootFish_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootFish_FavoritesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Favorites_Order_By>>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};


export type Query_RootFish_Favorites_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Favorites_Order_By>>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};


export type Query_RootFish_Favorites_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootFish_MonologuesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Monologues_Order_By>>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};


export type Query_RootFish_Monologues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Monologues_Order_By>>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};


export type Query_RootFish_Monologues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootFish_PersonalitiesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Personalities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Personalities_Order_By>>;
  where?: InputMaybe<Fish_Personalities_Bool_Exp>;
};


export type Query_RootFish_Personalities_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Personalities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Personalities_Order_By>>;
  where?: InputMaybe<Fish_Personalities_Bool_Exp>;
};


export type Query_RootFish_Personalities_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootGlobal_ParamsArgs = {
  distinct_on?: InputMaybe<Array<Global_Params_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Global_Params_Order_By>>;
  where?: InputMaybe<Global_Params_Bool_Exp>;
};


export type Query_RootGlobal_Params_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Global_Params_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Global_Params_Order_By>>;
  where?: InputMaybe<Global_Params_Bool_Exp>;
};


export type Query_RootGlobal_Params_By_PkArgs = {
  key: Scalars['String']['input'];
};


export type Query_RootGroup_ChatArgs = {
  distinct_on?: InputMaybe<Array<Group_Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Group_Chat_Order_By>>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};


export type Query_RootGroup_Chat_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Group_Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Group_Chat_Order_By>>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};


export type Query_RootGroup_Chat_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootMember_TypesArgs = {
  distinct_on?: InputMaybe<Array<Member_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Member_Types_Order_By>>;
  where?: InputMaybe<Member_Types_Bool_Exp>;
};


export type Query_RootMember_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Member_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Member_Types_Order_By>>;
  where?: InputMaybe<Member_Types_Bool_Exp>;
};


export type Query_RootMember_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootMessagesArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


export type Query_RootMessages_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


export type Query_RootMessages_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPublic_Messages_ViewArgs = {
  distinct_on?: InputMaybe<Array<Public_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Public_Messages_View_Order_By>>;
  where?: InputMaybe<Public_Messages_View_Bool_Exp>;
};


export type Query_RootPublic_Messages_View_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Public_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Public_Messages_View_Order_By>>;
  where?: InputMaybe<Public_Messages_View_Bool_Exp>;
};


export type Query_RootRecent_Chat_SessionsArgs = {
  distinct_on?: InputMaybe<Array<Recent_Chat_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Recent_Chat_Sessions_Order_By>>;
  where?: InputMaybe<Recent_Chat_Sessions_Bool_Exp>;
};


export type Query_RootRecent_Chat_Sessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Recent_Chat_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Recent_Chat_Sessions_Order_By>>;
  where?: InputMaybe<Recent_Chat_Sessions_Bool_Exp>;
};


export type Query_RootReportsArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


export type Query_RootReports_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


export type Query_RootReports_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUser_SubscriptionsArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


export type Query_RootUser_Subscriptions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


export type Query_RootUser_Subscriptions_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Query_RootUser_Visible_Messages_ViewArgs = {
  distinct_on?: InputMaybe<Array<User_Visible_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Visible_Messages_View_Order_By>>;
  where?: InputMaybe<User_Visible_Messages_View_Bool_Exp>;
};


export type Query_RootUser_Visible_Messages_View_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Visible_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Visible_Messages_View_Order_By>>;
  where?: InputMaybe<User_Visible_Messages_View_Bool_Exp>;
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootVotesArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};


export type Query_RootVotes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};


export type Query_RootVotes_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** Shows chat sessions from the last 24 hours with message counts */
export type Recent_Chat_Sessions = {
  __typename?: 'recent_chat_sessions';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  display_duration?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_count?: Maybe<Scalars['Int']['output']>;
  participant_fish_ids?: Maybe<Array<Scalars['uuid']['output']>>;
  time_of_day?: Maybe<Scalars['String']['output']>;
  topic?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "recent_chat_sessions" */
export type Recent_Chat_Sessions_Aggregate = {
  __typename?: 'recent_chat_sessions_aggregate';
  aggregate?: Maybe<Recent_Chat_Sessions_Aggregate_Fields>;
  nodes: Array<Recent_Chat_Sessions>;
};

/** aggregate fields of "recent_chat_sessions" */
export type Recent_Chat_Sessions_Aggregate_Fields = {
  __typename?: 'recent_chat_sessions_aggregate_fields';
  avg?: Maybe<Recent_Chat_Sessions_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Recent_Chat_Sessions_Max_Fields>;
  min?: Maybe<Recent_Chat_Sessions_Min_Fields>;
  stddev?: Maybe<Recent_Chat_Sessions_Stddev_Fields>;
  stddev_pop?: Maybe<Recent_Chat_Sessions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Recent_Chat_Sessions_Stddev_Samp_Fields>;
  sum?: Maybe<Recent_Chat_Sessions_Sum_Fields>;
  var_pop?: Maybe<Recent_Chat_Sessions_Var_Pop_Fields>;
  var_samp?: Maybe<Recent_Chat_Sessions_Var_Samp_Fields>;
  variance?: Maybe<Recent_Chat_Sessions_Variance_Fields>;
};


/** aggregate fields of "recent_chat_sessions" */
export type Recent_Chat_Sessions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Recent_Chat_Sessions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Recent_Chat_Sessions_Avg_Fields = {
  __typename?: 'recent_chat_sessions_avg_fields';
  display_duration?: Maybe<Scalars['Float']['output']>;
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "recent_chat_sessions". All fields are combined with a logical 'AND'. */
export type Recent_Chat_Sessions_Bool_Exp = {
  _and?: InputMaybe<Array<Recent_Chat_Sessions_Bool_Exp>>;
  _not?: InputMaybe<Recent_Chat_Sessions_Bool_Exp>;
  _or?: InputMaybe<Array<Recent_Chat_Sessions_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  display_duration?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  message_count?: InputMaybe<Int_Comparison_Exp>;
  participant_fish_ids?: InputMaybe<Uuid_Array_Comparison_Exp>;
  time_of_day?: InputMaybe<String_Comparison_Exp>;
  topic?: InputMaybe<String_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "recent_chat_sessions" */
export type Recent_Chat_Sessions_Inc_Input = {
  display_duration?: InputMaybe<Scalars['Int']['input']>;
  message_count?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "recent_chat_sessions" */
export type Recent_Chat_Sessions_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  display_duration?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_count?: InputMaybe<Scalars['Int']['input']>;
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  time_of_day?: InputMaybe<Scalars['String']['input']>;
  topic?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Recent_Chat_Sessions_Max_Fields = {
  __typename?: 'recent_chat_sessions_max_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  display_duration?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_count?: Maybe<Scalars['Int']['output']>;
  participant_fish_ids?: Maybe<Array<Scalars['uuid']['output']>>;
  time_of_day?: Maybe<Scalars['String']['output']>;
  topic?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Recent_Chat_Sessions_Min_Fields = {
  __typename?: 'recent_chat_sessions_min_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  display_duration?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_count?: Maybe<Scalars['Int']['output']>;
  participant_fish_ids?: Maybe<Array<Scalars['uuid']['output']>>;
  time_of_day?: Maybe<Scalars['String']['output']>;
  topic?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "recent_chat_sessions" */
export type Recent_Chat_Sessions_Mutation_Response = {
  __typename?: 'recent_chat_sessions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Recent_Chat_Sessions>;
};

/** Ordering options when selecting data from "recent_chat_sessions". */
export type Recent_Chat_Sessions_Order_By = {
  created_at?: InputMaybe<Order_By>;
  display_duration?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message_count?: InputMaybe<Order_By>;
  participant_fish_ids?: InputMaybe<Order_By>;
  time_of_day?: InputMaybe<Order_By>;
  topic?: InputMaybe<Order_By>;
};

/** select columns of table "recent_chat_sessions" */
export enum Recent_Chat_Sessions_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DisplayDuration = 'display_duration',
  /** column name */
  Id = 'id',
  /** column name */
  MessageCount = 'message_count',
  /** column name */
  ParticipantFishIds = 'participant_fish_ids',
  /** column name */
  TimeOfDay = 'time_of_day',
  /** column name */
  Topic = 'topic'
}

/** input type for updating data in table "recent_chat_sessions" */
export type Recent_Chat_Sessions_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  display_duration?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_count?: InputMaybe<Scalars['Int']['input']>;
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  time_of_day?: InputMaybe<Scalars['String']['input']>;
  topic?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Recent_Chat_Sessions_Stddev_Fields = {
  __typename?: 'recent_chat_sessions_stddev_fields';
  display_duration?: Maybe<Scalars['Float']['output']>;
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Recent_Chat_Sessions_Stddev_Pop_Fields = {
  __typename?: 'recent_chat_sessions_stddev_pop_fields';
  display_duration?: Maybe<Scalars['Float']['output']>;
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Recent_Chat_Sessions_Stddev_Samp_Fields = {
  __typename?: 'recent_chat_sessions_stddev_samp_fields';
  display_duration?: Maybe<Scalars['Float']['output']>;
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "recent_chat_sessions" */
export type Recent_Chat_Sessions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Recent_Chat_Sessions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Recent_Chat_Sessions_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  display_duration?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_count?: InputMaybe<Scalars['Int']['input']>;
  participant_fish_ids?: InputMaybe<Array<Scalars['uuid']['input']>>;
  time_of_day?: InputMaybe<Scalars['String']['input']>;
  topic?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Recent_Chat_Sessions_Sum_Fields = {
  __typename?: 'recent_chat_sessions_sum_fields';
  display_duration?: Maybe<Scalars['Int']['output']>;
  message_count?: Maybe<Scalars['Int']['output']>;
};

export type Recent_Chat_Sessions_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Recent_Chat_Sessions_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Recent_Chat_Sessions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Recent_Chat_Sessions_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Recent_Chat_Sessions_Var_Pop_Fields = {
  __typename?: 'recent_chat_sessions_var_pop_fields';
  display_duration?: Maybe<Scalars['Float']['output']>;
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Recent_Chat_Sessions_Var_Samp_Fields = {
  __typename?: 'recent_chat_sessions_var_samp_fields';
  display_duration?: Maybe<Scalars['Float']['output']>;
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Recent_Chat_Sessions_Variance_Fields = {
  __typename?: 'recent_chat_sessions_variance_fields';
  display_duration?: Maybe<Scalars['Float']['output']>;
  message_count?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "reports" */
export type Reports = {
  __typename?: 'reports';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** An object relationship */
  fish: Fish;
  fish_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  moderator_action?: Maybe<Scalars['String']['output']>;
  moderator_id?: Maybe<Scalars['String']['output']>;
  reason: Scalars['String']['output'];
  reporter_ip?: Maybe<Scalars['String']['output']>;
  resolved_at?: Maybe<Scalars['timestamp']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  user?: Maybe<Users>;
  user_agent?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "reports" */
export type Reports_Aggregate = {
  __typename?: 'reports_aggregate';
  aggregate?: Maybe<Reports_Aggregate_Fields>;
  nodes: Array<Reports>;
};

export type Reports_Aggregate_Bool_Exp = {
  count?: InputMaybe<Reports_Aggregate_Bool_Exp_Count>;
};

export type Reports_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Reports_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reports_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "reports" */
export type Reports_Aggregate_Fields = {
  __typename?: 'reports_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Reports_Max_Fields>;
  min?: Maybe<Reports_Min_Fields>;
};


/** aggregate fields of "reports" */
export type Reports_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Reports_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "reports" */
export type Reports_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Reports_Max_Order_By>;
  min?: InputMaybe<Reports_Min_Order_By>;
};

/** input type for inserting array relation for remote table "reports" */
export type Reports_Arr_Rel_Insert_Input = {
  data: Array<Reports_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Reports_On_Conflict>;
};

/** Boolean expression to filter rows from the table "reports". All fields are combined with a logical 'AND'. */
export type Reports_Bool_Exp = {
  _and?: InputMaybe<Array<Reports_Bool_Exp>>;
  _not?: InputMaybe<Reports_Bool_Exp>;
  _or?: InputMaybe<Array<Reports_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish?: InputMaybe<Fish_Bool_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  moderator_action?: InputMaybe<String_Comparison_Exp>;
  moderator_id?: InputMaybe<String_Comparison_Exp>;
  reason?: InputMaybe<String_Comparison_Exp>;
  reporter_ip?: InputMaybe<String_Comparison_Exp>;
  resolved_at?: InputMaybe<Timestamp_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  url?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_agent?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "reports" */
export enum Reports_Constraint {
  /** unique or primary key constraint on columns "id" */
  ReportsPkey = 'reports_pkey'
}

/** input type for inserting data into table "reports" */
export type Reports_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish?: InputMaybe<Fish_Obj_Rel_Insert_Input>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  moderator_action?: InputMaybe<Scalars['String']['input']>;
  moderator_id?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reporter_ip?: InputMaybe<Scalars['String']['input']>;
  resolved_at?: InputMaybe<Scalars['timestamp']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Reports_Max_Fields = {
  __typename?: 'reports_max_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  moderator_action?: Maybe<Scalars['String']['output']>;
  moderator_id?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  reporter_ip?: Maybe<Scalars['String']['output']>;
  resolved_at?: Maybe<Scalars['timestamp']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "reports" */
export type Reports_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  moderator_action?: InputMaybe<Order_By>;
  moderator_id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  reporter_ip?: InputMaybe<Order_By>;
  resolved_at?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Reports_Min_Fields = {
  __typename?: 'reports_min_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  moderator_action?: Maybe<Scalars['String']['output']>;
  moderator_id?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  reporter_ip?: Maybe<Scalars['String']['output']>;
  resolved_at?: Maybe<Scalars['timestamp']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "reports" */
export type Reports_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  moderator_action?: InputMaybe<Order_By>;
  moderator_id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  reporter_ip?: InputMaybe<Order_By>;
  resolved_at?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "reports" */
export type Reports_Mutation_Response = {
  __typename?: 'reports_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Reports>;
};

/** on_conflict condition type for table "reports" */
export type Reports_On_Conflict = {
  constraint: Reports_Constraint;
  update_columns?: Array<Reports_Update_Column>;
  where?: InputMaybe<Reports_Bool_Exp>;
};

/** Ordering options when selecting data from "reports". */
export type Reports_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish?: InputMaybe<Fish_Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  moderator_action?: InputMaybe<Order_By>;
  moderator_id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  reporter_ip?: InputMaybe<Order_By>;
  resolved_at?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

/** primary key columns input for table: reports */
export type Reports_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "reports" */
export enum Reports_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  ModeratorAction = 'moderator_action',
  /** column name */
  ModeratorId = 'moderator_id',
  /** column name */
  Reason = 'reason',
  /** column name */
  ReporterIp = 'reporter_ip',
  /** column name */
  ResolvedAt = 'resolved_at',
  /** column name */
  Status = 'status',
  /** column name */
  Url = 'url',
  /** column name */
  UserAgent = 'user_agent'
}

/** input type for updating data in table "reports" */
export type Reports_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  moderator_action?: InputMaybe<Scalars['String']['input']>;
  moderator_id?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reporter_ip?: InputMaybe<Scalars['String']['input']>;
  resolved_at?: InputMaybe<Scalars['timestamp']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "reports" */
export type Reports_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Reports_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Reports_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  moderator_action?: InputMaybe<Scalars['String']['input']>;
  moderator_id?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reporter_ip?: InputMaybe<Scalars['String']['input']>;
  resolved_at?: InputMaybe<Scalars['timestamp']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "reports" */
export enum Reports_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  ModeratorAction = 'moderator_action',
  /** column name */
  ModeratorId = 'moderator_id',
  /** column name */
  Reason = 'reason',
  /** column name */
  ReporterIp = 'reporter_ip',
  /** column name */
  ResolvedAt = 'resolved_at',
  /** column name */
  Status = 'status',
  /** column name */
  Url = 'url',
  /** column name */
  UserAgent = 'user_agent'
}

export type Reports_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Reports_Set_Input>;
  /** filter the rows which have to be updated */
  where: Reports_Bool_Exp;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "conversations" */
  conversations: Array<Conversations>;
  /** fetch aggregated fields from the table: "conversations" */
  conversations_aggregate: Conversations_Aggregate;
  /** fetch data from the table: "conversations" using primary key columns */
  conversations_by_pk?: Maybe<Conversations>;
  /** fetch data from the table in a streaming manner: "conversations" */
  conversations_stream: Array<Conversations>;
  /** fetch data from the table: "fish" */
  fish: Array<Fish>;
  /** fetch aggregated fields from the table: "fish" */
  fish_aggregate: Fish_Aggregate;
  /** fetch data from the table: "fish" using primary key columns */
  fish_by_pk?: Maybe<Fish>;
  /** An array relationship */
  fish_favorites: Array<Fish_Favorites>;
  /** An aggregate relationship */
  fish_favorites_aggregate: Fish_Favorites_Aggregate;
  /** fetch data from the table: "fish_favorites" using primary key columns */
  fish_favorites_by_pk?: Maybe<Fish_Favorites>;
  /** fetch data from the table in a streaming manner: "fish_favorites" */
  fish_favorites_stream: Array<Fish_Favorites>;
  /** An array relationship */
  fish_monologues: Array<Fish_Monologues>;
  /** An aggregate relationship */
  fish_monologues_aggregate: Fish_Monologues_Aggregate;
  /** fetch data from the table: "fish_monologues" using primary key columns */
  fish_monologues_by_pk?: Maybe<Fish_Monologues>;
  /** fetch data from the table in a streaming manner: "fish_monologues" */
  fish_monologues_stream: Array<Fish_Monologues>;
  /** fetch data from the table: "fish_personalities" */
  fish_personalities: Array<Fish_Personalities>;
  /** fetch aggregated fields from the table: "fish_personalities" */
  fish_personalities_aggregate: Fish_Personalities_Aggregate;
  /** fetch data from the table: "fish_personalities" using primary key columns */
  fish_personalities_by_pk?: Maybe<Fish_Personalities>;
  /** fetch data from the table in a streaming manner: "fish_personalities" */
  fish_personalities_stream: Array<Fish_Personalities>;
  /** fetch data from the table in a streaming manner: "fish" */
  fish_stream: Array<Fish>;
  /** fetch data from the table: "global_params" */
  global_params: Array<Global_Params>;
  /** fetch aggregated fields from the table: "global_params" */
  global_params_aggregate: Global_Params_Aggregate;
  /** fetch data from the table: "global_params" using primary key columns */
  global_params_by_pk?: Maybe<Global_Params>;
  /** fetch data from the table in a streaming manner: "global_params" */
  global_params_stream: Array<Global_Params>;
  /** An array relationship */
  group_chat: Array<Group_Chat>;
  /** An aggregate relationship */
  group_chat_aggregate: Group_Chat_Aggregate;
  /** fetch data from the table: "group_chat" using primary key columns */
  group_chat_by_pk?: Maybe<Group_Chat>;
  /** fetch data from the table in a streaming manner: "group_chat" */
  group_chat_stream: Array<Group_Chat>;
  /** fetch data from the table: "member_types" */
  member_types: Array<Member_Types>;
  /** fetch aggregated fields from the table: "member_types" */
  member_types_aggregate: Member_Types_Aggregate;
  /** fetch data from the table: "member_types" using primary key columns */
  member_types_by_pk?: Maybe<Member_Types>;
  /** fetch data from the table in a streaming manner: "member_types" */
  member_types_stream: Array<Member_Types>;
  /** An array relationship */
  messages: Array<Messages>;
  /** An aggregate relationship */
  messages_aggregate: Messages_Aggregate;
  /** fetch data from the table: "messages" using primary key columns */
  messages_by_pk?: Maybe<Messages>;
  /** fetch data from the table in a streaming manner: "messages" */
  messages_stream: Array<Messages>;
  /** fetch data from the table: "public_messages_view" */
  public_messages_view: Array<Public_Messages_View>;
  /** fetch aggregated fields from the table: "public_messages_view" */
  public_messages_view_aggregate: Public_Messages_View_Aggregate;
  /** fetch data from the table in a streaming manner: "public_messages_view" */
  public_messages_view_stream: Array<Public_Messages_View>;
  /** fetch data from the table: "recent_chat_sessions" */
  recent_chat_sessions: Array<Recent_Chat_Sessions>;
  /** fetch aggregated fields from the table: "recent_chat_sessions" */
  recent_chat_sessions_aggregate: Recent_Chat_Sessions_Aggregate;
  /** fetch data from the table in a streaming manner: "recent_chat_sessions" */
  recent_chat_sessions_stream: Array<Recent_Chat_Sessions>;
  /** An array relationship */
  reports: Array<Reports>;
  /** An aggregate relationship */
  reports_aggregate: Reports_Aggregate;
  /** fetch data from the table: "reports" using primary key columns */
  reports_by_pk?: Maybe<Reports>;
  /** fetch data from the table in a streaming manner: "reports" */
  reports_stream: Array<Reports>;
  /** An array relationship */
  user_subscriptions: Array<User_Subscriptions>;
  /** An aggregate relationship */
  user_subscriptions_aggregate: User_Subscriptions_Aggregate;
  /** fetch data from the table: "user_subscriptions" using primary key columns */
  user_subscriptions_by_pk?: Maybe<User_Subscriptions>;
  /** fetch data from the table in a streaming manner: "user_subscriptions" */
  user_subscriptions_stream: Array<User_Subscriptions>;
  /** fetch data from the table: "user_visible_messages_view" */
  user_visible_messages_view: Array<User_Visible_Messages_View>;
  /** fetch aggregated fields from the table: "user_visible_messages_view" */
  user_visible_messages_view_aggregate: User_Visible_Messages_View_Aggregate;
  /** fetch data from the table in a streaming manner: "user_visible_messages_view" */
  user_visible_messages_view_stream: Array<User_Visible_Messages_View>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
  /** An array relationship */
  votes: Array<Votes>;
  /** An aggregate relationship */
  votes_aggregate: Votes_Aggregate;
  /** fetch data from the table: "votes" using primary key columns */
  votes_by_pk?: Maybe<Votes>;
  /** fetch data from the table in a streaming manner: "votes" */
  votes_stream: Array<Votes>;
};


export type Subscription_RootConversationsArgs = {
  distinct_on?: InputMaybe<Array<Conversations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Conversations_Order_By>>;
  where?: InputMaybe<Conversations_Bool_Exp>;
};


export type Subscription_RootConversations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Conversations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Conversations_Order_By>>;
  where?: InputMaybe<Conversations_Bool_Exp>;
};


export type Subscription_RootConversations_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootConversations_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Conversations_Stream_Cursor_Input>>;
  where?: InputMaybe<Conversations_Bool_Exp>;
};


export type Subscription_RootFishArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


export type Subscription_RootFish_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


export type Subscription_RootFish_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootFish_FavoritesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Favorites_Order_By>>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};


export type Subscription_RootFish_Favorites_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Favorites_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Favorites_Order_By>>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};


export type Subscription_RootFish_Favorites_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootFish_Favorites_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Fish_Favorites_Stream_Cursor_Input>>;
  where?: InputMaybe<Fish_Favorites_Bool_Exp>;
};


export type Subscription_RootFish_MonologuesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Monologues_Order_By>>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};


export type Subscription_RootFish_Monologues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Monologues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Monologues_Order_By>>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};


export type Subscription_RootFish_Monologues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootFish_Monologues_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Fish_Monologues_Stream_Cursor_Input>>;
  where?: InputMaybe<Fish_Monologues_Bool_Exp>;
};


export type Subscription_RootFish_PersonalitiesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Personalities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Personalities_Order_By>>;
  where?: InputMaybe<Fish_Personalities_Bool_Exp>;
};


export type Subscription_RootFish_Personalities_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Personalities_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Personalities_Order_By>>;
  where?: InputMaybe<Fish_Personalities_Bool_Exp>;
};


export type Subscription_RootFish_Personalities_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootFish_Personalities_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Fish_Personalities_Stream_Cursor_Input>>;
  where?: InputMaybe<Fish_Personalities_Bool_Exp>;
};


export type Subscription_RootFish_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Fish_Stream_Cursor_Input>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


export type Subscription_RootGlobal_ParamsArgs = {
  distinct_on?: InputMaybe<Array<Global_Params_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Global_Params_Order_By>>;
  where?: InputMaybe<Global_Params_Bool_Exp>;
};


export type Subscription_RootGlobal_Params_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Global_Params_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Global_Params_Order_By>>;
  where?: InputMaybe<Global_Params_Bool_Exp>;
};


export type Subscription_RootGlobal_Params_By_PkArgs = {
  key: Scalars['String']['input'];
};


export type Subscription_RootGlobal_Params_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Global_Params_Stream_Cursor_Input>>;
  where?: InputMaybe<Global_Params_Bool_Exp>;
};


export type Subscription_RootGroup_ChatArgs = {
  distinct_on?: InputMaybe<Array<Group_Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Group_Chat_Order_By>>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};


export type Subscription_RootGroup_Chat_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Group_Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Group_Chat_Order_By>>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};


export type Subscription_RootGroup_Chat_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootGroup_Chat_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Group_Chat_Stream_Cursor_Input>>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};


export type Subscription_RootMember_TypesArgs = {
  distinct_on?: InputMaybe<Array<Member_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Member_Types_Order_By>>;
  where?: InputMaybe<Member_Types_Bool_Exp>;
};


export type Subscription_RootMember_Types_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Member_Types_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Member_Types_Order_By>>;
  where?: InputMaybe<Member_Types_Bool_Exp>;
};


export type Subscription_RootMember_Types_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootMember_Types_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Member_Types_Stream_Cursor_Input>>;
  where?: InputMaybe<Member_Types_Bool_Exp>;
};


export type Subscription_RootMessagesArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


export type Subscription_RootMessages_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


export type Subscription_RootMessages_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootMessages_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Messages_Stream_Cursor_Input>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


export type Subscription_RootPublic_Messages_ViewArgs = {
  distinct_on?: InputMaybe<Array<Public_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Public_Messages_View_Order_By>>;
  where?: InputMaybe<Public_Messages_View_Bool_Exp>;
};


export type Subscription_RootPublic_Messages_View_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Public_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Public_Messages_View_Order_By>>;
  where?: InputMaybe<Public_Messages_View_Bool_Exp>;
};


export type Subscription_RootPublic_Messages_View_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Public_Messages_View_Stream_Cursor_Input>>;
  where?: InputMaybe<Public_Messages_View_Bool_Exp>;
};


export type Subscription_RootRecent_Chat_SessionsArgs = {
  distinct_on?: InputMaybe<Array<Recent_Chat_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Recent_Chat_Sessions_Order_By>>;
  where?: InputMaybe<Recent_Chat_Sessions_Bool_Exp>;
};


export type Subscription_RootRecent_Chat_Sessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Recent_Chat_Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Recent_Chat_Sessions_Order_By>>;
  where?: InputMaybe<Recent_Chat_Sessions_Bool_Exp>;
};


export type Subscription_RootRecent_Chat_Sessions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Recent_Chat_Sessions_Stream_Cursor_Input>>;
  where?: InputMaybe<Recent_Chat_Sessions_Bool_Exp>;
};


export type Subscription_RootReportsArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


export type Subscription_RootReports_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


export type Subscription_RootReports_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootReports_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Reports_Stream_Cursor_Input>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


export type Subscription_RootUser_SubscriptionsArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


export type Subscription_RootUser_Subscriptions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


export type Subscription_RootUser_Subscriptions_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Subscription_RootUser_Subscriptions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Subscriptions_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


export type Subscription_RootUser_Visible_Messages_ViewArgs = {
  distinct_on?: InputMaybe<Array<User_Visible_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Visible_Messages_View_Order_By>>;
  where?: InputMaybe<User_Visible_Messages_View_Bool_Exp>;
};


export type Subscription_RootUser_Visible_Messages_View_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Visible_Messages_View_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Visible_Messages_View_Order_By>>;
  where?: InputMaybe<User_Visible_Messages_View_Bool_Exp>;
};


export type Subscription_RootUser_Visible_Messages_View_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Visible_Messages_View_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Visible_Messages_View_Bool_Exp>;
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootVotesArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};


export type Subscription_RootVotes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};


export type Subscription_RootVotes_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootVotes_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Votes_Stream_Cursor_Input>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']['input']>;
  _gt?: InputMaybe<Scalars['timestamp']['input']>;
  _gte?: InputMaybe<Scalars['timestamp']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamp']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamp']['input']>;
  _lte?: InputMaybe<Scalars['timestamp']['input']>;
  _neq?: InputMaybe<Scalars['timestamp']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']['input']>>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** columns and relationships of "user_subscriptions" */
export type User_Subscriptions = {
  __typename?: 'user_subscriptions';
  cancel_at_period_end?: Maybe<Scalars['Boolean']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  current_period_end?: Maybe<Scalars['timestamp']['output']>;
  current_period_start?: Maybe<Scalars['timestamp']['output']>;
  id: Scalars['Int']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  /** An object relationship */
  member_type: Member_Types;
  plan: Scalars['String']['output'];
  stripe_customer_id?: Maybe<Scalars['String']['output']>;
  stripe_subscription_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** An object relationship */
  user: Users;
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "user_subscriptions" */
export type User_Subscriptions_Aggregate = {
  __typename?: 'user_subscriptions_aggregate';
  aggregate?: Maybe<User_Subscriptions_Aggregate_Fields>;
  nodes: Array<User_Subscriptions>;
};

export type User_Subscriptions_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<User_Subscriptions_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<User_Subscriptions_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<User_Subscriptions_Aggregate_Bool_Exp_Count>;
};

export type User_Subscriptions_Aggregate_Bool_Exp_Bool_And = {
  arguments: User_Subscriptions_Select_Column_User_Subscriptions_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Subscriptions_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Subscriptions_Aggregate_Bool_Exp_Bool_Or = {
  arguments: User_Subscriptions_Select_Column_User_Subscriptions_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Subscriptions_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Subscriptions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Subscriptions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_subscriptions" */
export type User_Subscriptions_Aggregate_Fields = {
  __typename?: 'user_subscriptions_aggregate_fields';
  avg?: Maybe<User_Subscriptions_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Subscriptions_Max_Fields>;
  min?: Maybe<User_Subscriptions_Min_Fields>;
  stddev?: Maybe<User_Subscriptions_Stddev_Fields>;
  stddev_pop?: Maybe<User_Subscriptions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Subscriptions_Stddev_Samp_Fields>;
  sum?: Maybe<User_Subscriptions_Sum_Fields>;
  var_pop?: Maybe<User_Subscriptions_Var_Pop_Fields>;
  var_samp?: Maybe<User_Subscriptions_Var_Samp_Fields>;
  variance?: Maybe<User_Subscriptions_Variance_Fields>;
};


/** aggregate fields of "user_subscriptions" */
export type User_Subscriptions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user_subscriptions" */
export type User_Subscriptions_Aggregate_Order_By = {
  avg?: InputMaybe<User_Subscriptions_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Subscriptions_Max_Order_By>;
  min?: InputMaybe<User_Subscriptions_Min_Order_By>;
  stddev?: InputMaybe<User_Subscriptions_Stddev_Order_By>;
  stddev_pop?: InputMaybe<User_Subscriptions_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<User_Subscriptions_Stddev_Samp_Order_By>;
  sum?: InputMaybe<User_Subscriptions_Sum_Order_By>;
  var_pop?: InputMaybe<User_Subscriptions_Var_Pop_Order_By>;
  var_samp?: InputMaybe<User_Subscriptions_Var_Samp_Order_By>;
  variance?: InputMaybe<User_Subscriptions_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "user_subscriptions" */
export type User_Subscriptions_Arr_Rel_Insert_Input = {
  data: Array<User_Subscriptions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Subscriptions_On_Conflict>;
};

/** aggregate avg on columns */
export type User_Subscriptions_Avg_Fields = {
  __typename?: 'user_subscriptions_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "user_subscriptions" */
export type User_Subscriptions_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "user_subscriptions". All fields are combined with a logical 'AND'. */
export type User_Subscriptions_Bool_Exp = {
  _and?: InputMaybe<Array<User_Subscriptions_Bool_Exp>>;
  _not?: InputMaybe<User_Subscriptions_Bool_Exp>;
  _or?: InputMaybe<Array<User_Subscriptions_Bool_Exp>>;
  cancel_at_period_end?: InputMaybe<Boolean_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  current_period_end?: InputMaybe<Timestamp_Comparison_Exp>;
  current_period_start?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  member_type?: InputMaybe<Member_Types_Bool_Exp>;
  plan?: InputMaybe<String_Comparison_Exp>;
  stripe_customer_id?: InputMaybe<String_Comparison_Exp>;
  stripe_subscription_id?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_subscriptions" */
export enum User_Subscriptions_Constraint {
  /** unique or primary key constraint on columns "id" */
  UserSubscriptionsPkey = 'user_subscriptions_pkey'
}

/** input type for incrementing numeric columns in table "user_subscriptions" */
export type User_Subscriptions_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_subscriptions" */
export type User_Subscriptions_Insert_Input = {
  cancel_at_period_end?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  current_period_end?: InputMaybe<Scalars['timestamp']['input']>;
  current_period_start?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  member_type?: InputMaybe<Member_Types_Obj_Rel_Insert_Input>;
  plan?: InputMaybe<Scalars['String']['input']>;
  stripe_customer_id?: InputMaybe<Scalars['String']['input']>;
  stripe_subscription_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type User_Subscriptions_Max_Fields = {
  __typename?: 'user_subscriptions_max_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  current_period_end?: Maybe<Scalars['timestamp']['output']>;
  current_period_start?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  plan?: Maybe<Scalars['String']['output']>;
  stripe_customer_id?: Maybe<Scalars['String']['output']>;
  stripe_subscription_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "user_subscriptions" */
export type User_Subscriptions_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  current_period_end?: InputMaybe<Order_By>;
  current_period_start?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  plan?: InputMaybe<Order_By>;
  stripe_customer_id?: InputMaybe<Order_By>;
  stripe_subscription_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Subscriptions_Min_Fields = {
  __typename?: 'user_subscriptions_min_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  current_period_end?: Maybe<Scalars['timestamp']['output']>;
  current_period_start?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  plan?: Maybe<Scalars['String']['output']>;
  stripe_customer_id?: Maybe<Scalars['String']['output']>;
  stripe_subscription_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "user_subscriptions" */
export type User_Subscriptions_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  current_period_end?: InputMaybe<Order_By>;
  current_period_start?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  plan?: InputMaybe<Order_By>;
  stripe_customer_id?: InputMaybe<Order_By>;
  stripe_subscription_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user_subscriptions" */
export type User_Subscriptions_Mutation_Response = {
  __typename?: 'user_subscriptions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Subscriptions>;
};

/** on_conflict condition type for table "user_subscriptions" */
export type User_Subscriptions_On_Conflict = {
  constraint: User_Subscriptions_Constraint;
  update_columns?: Array<User_Subscriptions_Update_Column>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};

/** Ordering options when selecting data from "user_subscriptions". */
export type User_Subscriptions_Order_By = {
  cancel_at_period_end?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  current_period_end?: InputMaybe<Order_By>;
  current_period_start?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  member_type?: InputMaybe<Member_Types_Order_By>;
  plan?: InputMaybe<Order_By>;
  stripe_customer_id?: InputMaybe<Order_By>;
  stripe_subscription_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_subscriptions */
export type User_Subscriptions_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "user_subscriptions" */
export enum User_Subscriptions_Select_Column {
  /** column name */
  CancelAtPeriodEnd = 'cancel_at_period_end',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrentPeriodEnd = 'current_period_end',
  /** column name */
  CurrentPeriodStart = 'current_period_start',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Plan = 'plan',
  /** column name */
  StripeCustomerId = 'stripe_customer_id',
  /** column name */
  StripeSubscriptionId = 'stripe_subscription_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** select "user_subscriptions_aggregate_bool_exp_bool_and_arguments_columns" columns of table "user_subscriptions" */
export enum User_Subscriptions_Select_Column_User_Subscriptions_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  CancelAtPeriodEnd = 'cancel_at_period_end',
  /** column name */
  IsActive = 'is_active'
}

/** select "user_subscriptions_aggregate_bool_exp_bool_or_arguments_columns" columns of table "user_subscriptions" */
export enum User_Subscriptions_Select_Column_User_Subscriptions_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  CancelAtPeriodEnd = 'cancel_at_period_end',
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "user_subscriptions" */
export type User_Subscriptions_Set_Input = {
  cancel_at_period_end?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  current_period_end?: InputMaybe<Scalars['timestamp']['input']>;
  current_period_start?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  plan?: InputMaybe<Scalars['String']['input']>;
  stripe_customer_id?: InputMaybe<Scalars['String']['input']>;
  stripe_subscription_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type User_Subscriptions_Stddev_Fields = {
  __typename?: 'user_subscriptions_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "user_subscriptions" */
export type User_Subscriptions_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type User_Subscriptions_Stddev_Pop_Fields = {
  __typename?: 'user_subscriptions_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "user_subscriptions" */
export type User_Subscriptions_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type User_Subscriptions_Stddev_Samp_Fields = {
  __typename?: 'user_subscriptions_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "user_subscriptions" */
export type User_Subscriptions_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "user_subscriptions" */
export type User_Subscriptions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Subscriptions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Subscriptions_Stream_Cursor_Value_Input = {
  cancel_at_period_end?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  current_period_end?: InputMaybe<Scalars['timestamp']['input']>;
  current_period_start?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  plan?: InputMaybe<Scalars['String']['input']>;
  stripe_customer_id?: InputMaybe<Scalars['String']['input']>;
  stripe_subscription_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type User_Subscriptions_Sum_Fields = {
  __typename?: 'user_subscriptions_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "user_subscriptions" */
export type User_Subscriptions_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** update columns of table "user_subscriptions" */
export enum User_Subscriptions_Update_Column {
  /** column name */
  CancelAtPeriodEnd = 'cancel_at_period_end',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrentPeriodEnd = 'current_period_end',
  /** column name */
  CurrentPeriodStart = 'current_period_start',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Plan = 'plan',
  /** column name */
  StripeCustomerId = 'stripe_customer_id',
  /** column name */
  StripeSubscriptionId = 'stripe_subscription_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type User_Subscriptions_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Subscriptions_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Subscriptions_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Subscriptions_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Subscriptions_Var_Pop_Fields = {
  __typename?: 'user_subscriptions_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "user_subscriptions" */
export type User_Subscriptions_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type User_Subscriptions_Var_Samp_Fields = {
  __typename?: 'user_subscriptions_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "user_subscriptions" */
export type User_Subscriptions_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type User_Subscriptions_Variance_Fields = {
  __typename?: 'user_subscriptions_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "user_subscriptions" */
export type User_Subscriptions_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
};

/** columns and relationships of "user_visible_messages_view" */
export type User_Visible_Messages_View = {
  __typename?: 'user_visible_messages_view';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_type?: Maybe<Scalars['String']['output']>;
  receiver_id?: Maybe<Scalars['String']['output']>;
  sender_id?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "user_visible_messages_view" */
export type User_Visible_Messages_View_Aggregate = {
  __typename?: 'user_visible_messages_view_aggregate';
  aggregate?: Maybe<User_Visible_Messages_View_Aggregate_Fields>;
  nodes: Array<User_Visible_Messages_View>;
};

/** aggregate fields of "user_visible_messages_view" */
export type User_Visible_Messages_View_Aggregate_Fields = {
  __typename?: 'user_visible_messages_view_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Visible_Messages_View_Max_Fields>;
  min?: Maybe<User_Visible_Messages_View_Min_Fields>;
};


/** aggregate fields of "user_visible_messages_view" */
export type User_Visible_Messages_View_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Visible_Messages_View_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "user_visible_messages_view". All fields are combined with a logical 'AND'. */
export type User_Visible_Messages_View_Bool_Exp = {
  _and?: InputMaybe<Array<User_Visible_Messages_View_Bool_Exp>>;
  _not?: InputMaybe<User_Visible_Messages_View_Bool_Exp>;
  _or?: InputMaybe<Array<User_Visible_Messages_View_Bool_Exp>>;
  content?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  message_type?: InputMaybe<String_Comparison_Exp>;
  receiver_id?: InputMaybe<String_Comparison_Exp>;
  sender_id?: InputMaybe<String_Comparison_Exp>;
  visibility?: InputMaybe<String_Comparison_Exp>;
};

/** input type for inserting data into table "user_visible_messages_view" */
export type User_Visible_Messages_View_Insert_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_type?: InputMaybe<Scalars['String']['input']>;
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  sender_id?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type User_Visible_Messages_View_Max_Fields = {
  __typename?: 'user_visible_messages_view_max_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_type?: Maybe<Scalars['String']['output']>;
  receiver_id?: Maybe<Scalars['String']['output']>;
  sender_id?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type User_Visible_Messages_View_Min_Fields = {
  __typename?: 'user_visible_messages_view_min_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  message_type?: Maybe<Scalars['String']['output']>;
  receiver_id?: Maybe<Scalars['String']['output']>;
  sender_id?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "user_visible_messages_view" */
export type User_Visible_Messages_View_Mutation_Response = {
  __typename?: 'user_visible_messages_view_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Visible_Messages_View>;
};

/** Ordering options when selecting data from "user_visible_messages_view". */
export type User_Visible_Messages_View_Order_By = {
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  message_type?: InputMaybe<Order_By>;
  receiver_id?: InputMaybe<Order_By>;
  sender_id?: InputMaybe<Order_By>;
  visibility?: InputMaybe<Order_By>;
};

/** select columns of table "user_visible_messages_view" */
export enum User_Visible_Messages_View_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  MessageType = 'message_type',
  /** column name */
  ReceiverId = 'receiver_id',
  /** column name */
  SenderId = 'sender_id',
  /** column name */
  Visibility = 'visibility'
}

/** input type for updating data in table "user_visible_messages_view" */
export type User_Visible_Messages_View_Set_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_type?: InputMaybe<Scalars['String']['input']>;
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  sender_id?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "user_visible_messages_view" */
export type User_Visible_Messages_View_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Visible_Messages_View_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Visible_Messages_View_Stream_Cursor_Value_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  message_type?: InputMaybe<Scalars['String']['input']>;
  receiver_id?: InputMaybe<Scalars['String']['input']>;
  sender_id?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<Scalars['String']['input']>;
};

export type User_Visible_Messages_View_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Visible_Messages_View_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Visible_Messages_View_Bool_Exp;
};

/** columns and relationships of "users" */
export type Users = {
  __typename?: 'users';
  about_me?: Maybe<Scalars['String']['output']>;
  avatar_url?: Maybe<Scalars['String']['output']>;
  ban_reason?: Maybe<Scalars['String']['output']>;
  banned_until?: Maybe<Scalars['timestamp']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  email: Scalars['String']['output'];
  fish_talk?: Maybe<Scalars['Boolean']['output']>;
  /** An array relationship */
  fishes: Array<Fish>;
  /** An aggregate relationship */
  fishes_aggregate: Fish_Aggregate;
  /** An array relationship */
  group_chat: Array<Group_Chat>;
  /** An aggregate relationship */
  group_chat_aggregate: Group_Chat_Aggregate;
  id: Scalars['String']['output'];
  is_banned?: Maybe<Scalars['Boolean']['output']>;
  last_active?: Maybe<Scalars['timestamp']['output']>;
  /** An array relationship */
  messages: Array<Messages>;
  /** An array relationship */
  messagesBySenderId: Array<Messages>;
  /** An aggregate relationship */
  messagesBySenderId_aggregate: Messages_Aggregate;
  /** An aggregate relationship */
  messages_aggregate: Messages_Aggregate;
  nick_name?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  reports: Array<Reports>;
  /** An aggregate relationship */
  reports_aggregate: Reports_Aggregate;
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** 用户选择的语言（英文全称），用于群聊模式等场景。支持：English, French, Spanish, Chinese, Traditional Chinese, Japanese, Korean */
  user_language?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  user_subscriptions: Array<User_Subscriptions>;
  /** An aggregate relationship */
  user_subscriptions_aggregate: User_Subscriptions_Aggregate;
  /** An array relationship */
  votes: Array<Votes>;
  /** An aggregate relationship */
  votes_aggregate: Votes_Aggregate;
};


/** columns and relationships of "users" */
export type UsersFishesArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersFishes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Order_By>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersGroup_ChatArgs = {
  distinct_on?: InputMaybe<Array<Group_Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Group_Chat_Order_By>>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersGroup_Chat_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Group_Chat_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Group_Chat_Order_By>>;
  where?: InputMaybe<Group_Chat_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersMessagesArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersMessagesBySenderIdArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersMessagesBySenderId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersMessages_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Messages_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Messages_Order_By>>;
  where?: InputMaybe<Messages_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersReportsArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersReports_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reports_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reports_Order_By>>;
  where?: InputMaybe<Reports_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersUser_SubscriptionsArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersUser_Subscriptions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Subscriptions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Subscriptions_Order_By>>;
  where?: InputMaybe<User_Subscriptions_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersVotesArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersVotes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Votes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Votes_Order_By>>;
  where?: InputMaybe<Votes_Bool_Exp>;
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  avg?: Maybe<Users_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
  stddev?: Maybe<Users_Stddev_Fields>;
  stddev_pop?: Maybe<Users_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Users_Stddev_Samp_Fields>;
  sum?: Maybe<Users_Sum_Fields>;
  var_pop?: Maybe<Users_Var_Pop_Fields>;
  var_samp?: Maybe<Users_Var_Samp_Fields>;
  variance?: Maybe<Users_Variance_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Users_Avg_Fields = {
  __typename?: 'users_avg_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  about_me?: InputMaybe<String_Comparison_Exp>;
  avatar_url?: InputMaybe<String_Comparison_Exp>;
  ban_reason?: InputMaybe<String_Comparison_Exp>;
  banned_until?: InputMaybe<Timestamp_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  fish_talk?: InputMaybe<Boolean_Comparison_Exp>;
  fishes?: InputMaybe<Fish_Bool_Exp>;
  fishes_aggregate?: InputMaybe<Fish_Aggregate_Bool_Exp>;
  group_chat?: InputMaybe<Group_Chat_Bool_Exp>;
  group_chat_aggregate?: InputMaybe<Group_Chat_Aggregate_Bool_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_banned?: InputMaybe<Boolean_Comparison_Exp>;
  last_active?: InputMaybe<Timestamp_Comparison_Exp>;
  messages?: InputMaybe<Messages_Bool_Exp>;
  messagesBySenderId?: InputMaybe<Messages_Bool_Exp>;
  messagesBySenderId_aggregate?: InputMaybe<Messages_Aggregate_Bool_Exp>;
  messages_aggregate?: InputMaybe<Messages_Aggregate_Bool_Exp>;
  nick_name?: InputMaybe<String_Comparison_Exp>;
  reports?: InputMaybe<Reports_Bool_Exp>;
  reports_aggregate?: InputMaybe<Reports_Aggregate_Bool_Exp>;
  reputation_score?: InputMaybe<Int_Comparison_Exp>;
  total_fish_created?: InputMaybe<Int_Comparison_Exp>;
  total_votes_received?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  user_language?: InputMaybe<String_Comparison_Exp>;
  user_subscriptions?: InputMaybe<User_Subscriptions_Bool_Exp>;
  user_subscriptions_aggregate?: InputMaybe<User_Subscriptions_Aggregate_Bool_Exp>;
  votes?: InputMaybe<Votes_Bool_Exp>;
  votes_aggregate?: InputMaybe<Votes_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey'
}

/** input type for incrementing numeric columns in table "users" */
export type Users_Inc_Input = {
  reputation_score?: InputMaybe<Scalars['Int']['input']>;
  total_fish_created?: InputMaybe<Scalars['Int']['input']>;
  total_votes_received?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  about_me?: InputMaybe<Scalars['String']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  ban_reason?: InputMaybe<Scalars['String']['input']>;
  banned_until?: InputMaybe<Scalars['timestamp']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fish_talk?: InputMaybe<Scalars['Boolean']['input']>;
  fishes?: InputMaybe<Fish_Arr_Rel_Insert_Input>;
  group_chat?: InputMaybe<Group_Chat_Arr_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['String']['input']>;
  is_banned?: InputMaybe<Scalars['Boolean']['input']>;
  last_active?: InputMaybe<Scalars['timestamp']['input']>;
  messages?: InputMaybe<Messages_Arr_Rel_Insert_Input>;
  messagesBySenderId?: InputMaybe<Messages_Arr_Rel_Insert_Input>;
  nick_name?: InputMaybe<Scalars['String']['input']>;
  reports?: InputMaybe<Reports_Arr_Rel_Insert_Input>;
  reputation_score?: InputMaybe<Scalars['Int']['input']>;
  total_fish_created?: InputMaybe<Scalars['Int']['input']>;
  total_votes_received?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 用户选择的语言（英文全称），用于群聊模式等场景。支持：English, French, Spanish, Chinese, Traditional Chinese, Japanese, Korean */
  user_language?: InputMaybe<Scalars['String']['input']>;
  user_subscriptions?: InputMaybe<User_Subscriptions_Arr_Rel_Insert_Input>;
  votes?: InputMaybe<Votes_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  about_me?: Maybe<Scalars['String']['output']>;
  avatar_url?: Maybe<Scalars['String']['output']>;
  ban_reason?: Maybe<Scalars['String']['output']>;
  banned_until?: Maybe<Scalars['timestamp']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  last_active?: Maybe<Scalars['timestamp']['output']>;
  nick_name?: Maybe<Scalars['String']['output']>;
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** 用户选择的语言（英文全称），用于群聊模式等场景。支持：English, French, Spanish, Chinese, Traditional Chinese, Japanese, Korean */
  user_language?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  about_me?: Maybe<Scalars['String']['output']>;
  avatar_url?: Maybe<Scalars['String']['output']>;
  ban_reason?: Maybe<Scalars['String']['output']>;
  banned_until?: Maybe<Scalars['timestamp']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  last_active?: Maybe<Scalars['timestamp']['output']>;
  nick_name?: Maybe<Scalars['String']['output']>;
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** 用户选择的语言（英文全称），用于群聊模式等场景。支持：English, French, Spanish, Chinese, Traditional Chinese, Japanese, Korean */
  user_language?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  about_me?: InputMaybe<Order_By>;
  avatar_url?: InputMaybe<Order_By>;
  ban_reason?: InputMaybe<Order_By>;
  banned_until?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  fish_talk?: InputMaybe<Order_By>;
  fishes_aggregate?: InputMaybe<Fish_Aggregate_Order_By>;
  group_chat_aggregate?: InputMaybe<Group_Chat_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  is_banned?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  messagesBySenderId_aggregate?: InputMaybe<Messages_Aggregate_Order_By>;
  messages_aggregate?: InputMaybe<Messages_Aggregate_Order_By>;
  nick_name?: InputMaybe<Order_By>;
  reports_aggregate?: InputMaybe<Reports_Aggregate_Order_By>;
  reputation_score?: InputMaybe<Order_By>;
  total_fish_created?: InputMaybe<Order_By>;
  total_votes_received?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_language?: InputMaybe<Order_By>;
  user_subscriptions_aggregate?: InputMaybe<User_Subscriptions_Aggregate_Order_By>;
  votes_aggregate?: InputMaybe<Votes_Aggregate_Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  AboutMe = 'about_me',
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  BanReason = 'ban_reason',
  /** column name */
  BannedUntil = 'banned_until',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  FishTalk = 'fish_talk',
  /** column name */
  Id = 'id',
  /** column name */
  IsBanned = 'is_banned',
  /** column name */
  LastActive = 'last_active',
  /** column name */
  NickName = 'nick_name',
  /** column name */
  ReputationScore = 'reputation_score',
  /** column name */
  TotalFishCreated = 'total_fish_created',
  /** column name */
  TotalVotesReceived = 'total_votes_received',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserLanguage = 'user_language'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  about_me?: InputMaybe<Scalars['String']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  ban_reason?: InputMaybe<Scalars['String']['input']>;
  banned_until?: InputMaybe<Scalars['timestamp']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fish_talk?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  is_banned?: InputMaybe<Scalars['Boolean']['input']>;
  last_active?: InputMaybe<Scalars['timestamp']['input']>;
  nick_name?: InputMaybe<Scalars['String']['input']>;
  reputation_score?: InputMaybe<Scalars['Int']['input']>;
  total_fish_created?: InputMaybe<Scalars['Int']['input']>;
  total_votes_received?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 用户选择的语言（英文全称），用于群聊模式等场景。支持：English, French, Spanish, Chinese, Traditional Chinese, Japanese, Korean */
  user_language?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  __typename?: 'users_stddev_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Users_Stddev_Pop_Fields = {
  __typename?: 'users_stddev_pop_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Users_Stddev_Samp_Fields = {
  __typename?: 'users_stddev_samp_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  about_me?: InputMaybe<Scalars['String']['input']>;
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  ban_reason?: InputMaybe<Scalars['String']['input']>;
  banned_until?: InputMaybe<Scalars['timestamp']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fish_talk?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  is_banned?: InputMaybe<Scalars['Boolean']['input']>;
  last_active?: InputMaybe<Scalars['timestamp']['input']>;
  nick_name?: InputMaybe<Scalars['String']['input']>;
  reputation_score?: InputMaybe<Scalars['Int']['input']>;
  total_fish_created?: InputMaybe<Scalars['Int']['input']>;
  total_votes_received?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  /** 用户选择的语言（英文全称），用于群聊模式等场景。支持：English, French, Spanish, Chinese, Traditional Chinese, Japanese, Korean */
  user_language?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  __typename?: 'users_sum_fields';
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  AboutMe = 'about_me',
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  BanReason = 'ban_reason',
  /** column name */
  BannedUntil = 'banned_until',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  FishTalk = 'fish_talk',
  /** column name */
  Id = 'id',
  /** column name */
  IsBanned = 'is_banned',
  /** column name */
  LastActive = 'last_active',
  /** column name */
  NickName = 'nick_name',
  /** column name */
  ReputationScore = 'reputation_score',
  /** column name */
  TotalFishCreated = 'total_fish_created',
  /** column name */
  TotalVotesReceived = 'total_votes_received',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserLanguage = 'user_language'
}

export type Users_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Users_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Users_Var_Pop_Fields = {
  __typename?: 'users_var_pop_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Users_Var_Samp_Fields = {
  __typename?: 'users_var_samp_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Users_Variance_Fields = {
  __typename?: 'users_variance_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Array_Comparison_Exp = {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _eq?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _gt?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _gte?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _in?: InputMaybe<Array<Array<Scalars['uuid']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _lte?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _neq?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _nin?: InputMaybe<Array<Array<Scalars['uuid']['input']>>>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

/** columns and relationships of "votes" */
export type Votes = {
  __typename?: 'votes';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** An object relationship */
  fish: Fish;
  fish_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['String']['output'];
  vote_type: Scalars['String']['output'];
};

/** aggregated selection of "votes" */
export type Votes_Aggregate = {
  __typename?: 'votes_aggregate';
  aggregate?: Maybe<Votes_Aggregate_Fields>;
  nodes: Array<Votes>;
};

export type Votes_Aggregate_Bool_Exp = {
  count?: InputMaybe<Votes_Aggregate_Bool_Exp_Count>;
};

export type Votes_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Votes_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Votes_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "votes" */
export type Votes_Aggregate_Fields = {
  __typename?: 'votes_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Votes_Max_Fields>;
  min?: Maybe<Votes_Min_Fields>;
};


/** aggregate fields of "votes" */
export type Votes_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Votes_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "votes" */
export type Votes_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Votes_Max_Order_By>;
  min?: InputMaybe<Votes_Min_Order_By>;
};

/** input type for inserting array relation for remote table "votes" */
export type Votes_Arr_Rel_Insert_Input = {
  data: Array<Votes_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Votes_On_Conflict>;
};

/** Boolean expression to filter rows from the table "votes". All fields are combined with a logical 'AND'. */
export type Votes_Bool_Exp = {
  _and?: InputMaybe<Array<Votes_Bool_Exp>>;
  _not?: InputMaybe<Votes_Bool_Exp>;
  _or?: InputMaybe<Array<Votes_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish?: InputMaybe<Fish_Bool_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
  vote_type?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "votes" */
export enum Votes_Constraint {
  /** unique or primary key constraint on columns "user_id", "fish_id" */
  VotesFishIdUserIdKey = 'votes_fish_id_user_id_key',
  /** unique or primary key constraint on columns "id" */
  VotesPkey = 'votes_pkey'
}

/** input type for inserting data into table "votes" */
export type Votes_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish?: InputMaybe<Fish_Obj_Rel_Insert_Input>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['String']['input']>;
  vote_type?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Votes_Max_Fields = {
  __typename?: 'votes_max_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
  vote_type?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "votes" */
export type Votes_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  vote_type?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Votes_Min_Fields = {
  __typename?: 'votes_min_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
  vote_type?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "votes" */
export type Votes_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  vote_type?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "votes" */
export type Votes_Mutation_Response = {
  __typename?: 'votes_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Votes>;
};

/** on_conflict condition type for table "votes" */
export type Votes_On_Conflict = {
  constraint: Votes_Constraint;
  update_columns?: Array<Votes_Update_Column>;
  where?: InputMaybe<Votes_Bool_Exp>;
};

/** Ordering options when selecting data from "votes". */
export type Votes_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish?: InputMaybe<Fish_Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  vote_type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: votes */
export type Votes_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "votes" */
export enum Votes_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VoteType = 'vote_type'
}

/** input type for updating data in table "votes" */
export type Votes_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
  vote_type?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "votes" */
export type Votes_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Votes_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Votes_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
  vote_type?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "votes" */
export enum Votes_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VoteType = 'vote_type'
}

export type Votes_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Votes_Set_Input>;
  /** filter the rows which have to be updated */
  where: Votes_Bool_Exp;
};
