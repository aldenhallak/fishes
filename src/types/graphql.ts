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
  float8: { input: any; output: any; }
  numeric: { input: any; output: any; }
  timestamp: { input: any; output: any; }
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

/** columns and relationships of "battle_config" */
export type Battle_Config = {
  __typename?: 'battle_config';
  exp_for_level_up_base?: Maybe<Scalars['Int']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['numeric']['output']>;
  exp_per_second?: Maybe<Scalars['Int']['output']>;
  exp_per_win?: Maybe<Scalars['Int']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Int']['output']>;
  health_per_feed?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  level_weight?: Maybe<Scalars['numeric']['output']>;
  max_health_per_level?: Maybe<Scalars['Int']['output']>;
  random_factor?: Maybe<Scalars['numeric']['output']>;
  talent_weight?: Maybe<Scalars['numeric']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  upvote_weight?: Maybe<Scalars['numeric']['output']>;
};

/** aggregated selection of "battle_config" */
export type Battle_Config_Aggregate = {
  __typename?: 'battle_config_aggregate';
  aggregate?: Maybe<Battle_Config_Aggregate_Fields>;
  nodes: Array<Battle_Config>;
};

/** aggregate fields of "battle_config" */
export type Battle_Config_Aggregate_Fields = {
  __typename?: 'battle_config_aggregate_fields';
  avg?: Maybe<Battle_Config_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Battle_Config_Max_Fields>;
  min?: Maybe<Battle_Config_Min_Fields>;
  stddev?: Maybe<Battle_Config_Stddev_Fields>;
  stddev_pop?: Maybe<Battle_Config_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Battle_Config_Stddev_Samp_Fields>;
  sum?: Maybe<Battle_Config_Sum_Fields>;
  var_pop?: Maybe<Battle_Config_Var_Pop_Fields>;
  var_samp?: Maybe<Battle_Config_Var_Samp_Fields>;
  variance?: Maybe<Battle_Config_Variance_Fields>;
};


/** aggregate fields of "battle_config" */
export type Battle_Config_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Battle_Config_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Battle_Config_Avg_Fields = {
  __typename?: 'battle_config_avg_fields';
  exp_for_level_up_base?: Maybe<Scalars['Float']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['Float']['output']>;
  exp_per_second?: Maybe<Scalars['Float']['output']>;
  exp_per_win?: Maybe<Scalars['Float']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Float']['output']>;
  health_per_feed?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  level_weight?: Maybe<Scalars['Float']['output']>;
  max_health_per_level?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
  talent_weight?: Maybe<Scalars['Float']['output']>;
  upvote_weight?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "battle_config". All fields are combined with a logical 'AND'. */
export type Battle_Config_Bool_Exp = {
  _and?: InputMaybe<Array<Battle_Config_Bool_Exp>>;
  _not?: InputMaybe<Battle_Config_Bool_Exp>;
  _or?: InputMaybe<Array<Battle_Config_Bool_Exp>>;
  exp_for_level_up_base?: InputMaybe<Int_Comparison_Exp>;
  exp_for_level_up_multiplier?: InputMaybe<Numeric_Comparison_Exp>;
  exp_per_second?: InputMaybe<Int_Comparison_Exp>;
  exp_per_win?: InputMaybe<Int_Comparison_Exp>;
  health_loss_per_defeat?: InputMaybe<Int_Comparison_Exp>;
  health_per_feed?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  level_weight?: InputMaybe<Numeric_Comparison_Exp>;
  max_health_per_level?: InputMaybe<Int_Comparison_Exp>;
  random_factor?: InputMaybe<Numeric_Comparison_Exp>;
  talent_weight?: InputMaybe<Numeric_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  upvote_weight?: InputMaybe<Numeric_Comparison_Exp>;
};

/** unique or primary key constraints on table "battle_config" */
export enum Battle_Config_Constraint {
  /** unique or primary key constraint on columns "id" */
  BattleConfigPkey = 'battle_config_pkey'
}

/** input type for incrementing numeric columns in table "battle_config" */
export type Battle_Config_Inc_Input = {
  exp_for_level_up_base?: InputMaybe<Scalars['Int']['input']>;
  exp_for_level_up_multiplier?: InputMaybe<Scalars['numeric']['input']>;
  exp_per_second?: InputMaybe<Scalars['Int']['input']>;
  exp_per_win?: InputMaybe<Scalars['Int']['input']>;
  health_loss_per_defeat?: InputMaybe<Scalars['Int']['input']>;
  health_per_feed?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  level_weight?: InputMaybe<Scalars['numeric']['input']>;
  max_health_per_level?: InputMaybe<Scalars['Int']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
  talent_weight?: InputMaybe<Scalars['numeric']['input']>;
  upvote_weight?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "battle_config" */
export type Battle_Config_Insert_Input = {
  exp_for_level_up_base?: InputMaybe<Scalars['Int']['input']>;
  exp_for_level_up_multiplier?: InputMaybe<Scalars['numeric']['input']>;
  exp_per_second?: InputMaybe<Scalars['Int']['input']>;
  exp_per_win?: InputMaybe<Scalars['Int']['input']>;
  health_loss_per_defeat?: InputMaybe<Scalars['Int']['input']>;
  health_per_feed?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  level_weight?: InputMaybe<Scalars['numeric']['input']>;
  max_health_per_level?: InputMaybe<Scalars['Int']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
  talent_weight?: InputMaybe<Scalars['numeric']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  upvote_weight?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate max on columns */
export type Battle_Config_Max_Fields = {
  __typename?: 'battle_config_max_fields';
  exp_for_level_up_base?: Maybe<Scalars['Int']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['numeric']['output']>;
  exp_per_second?: Maybe<Scalars['Int']['output']>;
  exp_per_win?: Maybe<Scalars['Int']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Int']['output']>;
  health_per_feed?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  level_weight?: Maybe<Scalars['numeric']['output']>;
  max_health_per_level?: Maybe<Scalars['Int']['output']>;
  random_factor?: Maybe<Scalars['numeric']['output']>;
  talent_weight?: Maybe<Scalars['numeric']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  upvote_weight?: Maybe<Scalars['numeric']['output']>;
};

/** aggregate min on columns */
export type Battle_Config_Min_Fields = {
  __typename?: 'battle_config_min_fields';
  exp_for_level_up_base?: Maybe<Scalars['Int']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['numeric']['output']>;
  exp_per_second?: Maybe<Scalars['Int']['output']>;
  exp_per_win?: Maybe<Scalars['Int']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Int']['output']>;
  health_per_feed?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  level_weight?: Maybe<Scalars['numeric']['output']>;
  max_health_per_level?: Maybe<Scalars['Int']['output']>;
  random_factor?: Maybe<Scalars['numeric']['output']>;
  talent_weight?: Maybe<Scalars['numeric']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  upvote_weight?: Maybe<Scalars['numeric']['output']>;
};

/** response of any mutation on the table "battle_config" */
export type Battle_Config_Mutation_Response = {
  __typename?: 'battle_config_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Battle_Config>;
};

/** on_conflict condition type for table "battle_config" */
export type Battle_Config_On_Conflict = {
  constraint: Battle_Config_Constraint;
  update_columns?: Array<Battle_Config_Update_Column>;
  where?: InputMaybe<Battle_Config_Bool_Exp>;
};

/** Ordering options when selecting data from "battle_config". */
export type Battle_Config_Order_By = {
  exp_for_level_up_base?: InputMaybe<Order_By>;
  exp_for_level_up_multiplier?: InputMaybe<Order_By>;
  exp_per_second?: InputMaybe<Order_By>;
  exp_per_win?: InputMaybe<Order_By>;
  health_loss_per_defeat?: InputMaybe<Order_By>;
  health_per_feed?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  level_weight?: InputMaybe<Order_By>;
  max_health_per_level?: InputMaybe<Order_By>;
  random_factor?: InputMaybe<Order_By>;
  talent_weight?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  upvote_weight?: InputMaybe<Order_By>;
};

/** primary key columns input for table: battle_config */
export type Battle_Config_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "battle_config" */
export enum Battle_Config_Select_Column {
  /** column name */
  ExpForLevelUpBase = 'exp_for_level_up_base',
  /** column name */
  ExpForLevelUpMultiplier = 'exp_for_level_up_multiplier',
  /** column name */
  ExpPerSecond = 'exp_per_second',
  /** column name */
  ExpPerWin = 'exp_per_win',
  /** column name */
  HealthLossPerDefeat = 'health_loss_per_defeat',
  /** column name */
  HealthPerFeed = 'health_per_feed',
  /** column name */
  Id = 'id',
  /** column name */
  LevelWeight = 'level_weight',
  /** column name */
  MaxHealthPerLevel = 'max_health_per_level',
  /** column name */
  RandomFactor = 'random_factor',
  /** column name */
  TalentWeight = 'talent_weight',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpvoteWeight = 'upvote_weight'
}

/** input type for updating data in table "battle_config" */
export type Battle_Config_Set_Input = {
  exp_for_level_up_base?: InputMaybe<Scalars['Int']['input']>;
  exp_for_level_up_multiplier?: InputMaybe<Scalars['numeric']['input']>;
  exp_per_second?: InputMaybe<Scalars['Int']['input']>;
  exp_per_win?: InputMaybe<Scalars['Int']['input']>;
  health_loss_per_defeat?: InputMaybe<Scalars['Int']['input']>;
  health_per_feed?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  level_weight?: InputMaybe<Scalars['numeric']['input']>;
  max_health_per_level?: InputMaybe<Scalars['Int']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
  talent_weight?: InputMaybe<Scalars['numeric']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  upvote_weight?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate stddev on columns */
export type Battle_Config_Stddev_Fields = {
  __typename?: 'battle_config_stddev_fields';
  exp_for_level_up_base?: Maybe<Scalars['Float']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['Float']['output']>;
  exp_per_second?: Maybe<Scalars['Float']['output']>;
  exp_per_win?: Maybe<Scalars['Float']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Float']['output']>;
  health_per_feed?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  level_weight?: Maybe<Scalars['Float']['output']>;
  max_health_per_level?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
  talent_weight?: Maybe<Scalars['Float']['output']>;
  upvote_weight?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Battle_Config_Stddev_Pop_Fields = {
  __typename?: 'battle_config_stddev_pop_fields';
  exp_for_level_up_base?: Maybe<Scalars['Float']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['Float']['output']>;
  exp_per_second?: Maybe<Scalars['Float']['output']>;
  exp_per_win?: Maybe<Scalars['Float']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Float']['output']>;
  health_per_feed?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  level_weight?: Maybe<Scalars['Float']['output']>;
  max_health_per_level?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
  talent_weight?: Maybe<Scalars['Float']['output']>;
  upvote_weight?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Battle_Config_Stddev_Samp_Fields = {
  __typename?: 'battle_config_stddev_samp_fields';
  exp_for_level_up_base?: Maybe<Scalars['Float']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['Float']['output']>;
  exp_per_second?: Maybe<Scalars['Float']['output']>;
  exp_per_win?: Maybe<Scalars['Float']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Float']['output']>;
  health_per_feed?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  level_weight?: Maybe<Scalars['Float']['output']>;
  max_health_per_level?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
  talent_weight?: Maybe<Scalars['Float']['output']>;
  upvote_weight?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "battle_config" */
export type Battle_Config_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Battle_Config_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Battle_Config_Stream_Cursor_Value_Input = {
  exp_for_level_up_base?: InputMaybe<Scalars['Int']['input']>;
  exp_for_level_up_multiplier?: InputMaybe<Scalars['numeric']['input']>;
  exp_per_second?: InputMaybe<Scalars['Int']['input']>;
  exp_per_win?: InputMaybe<Scalars['Int']['input']>;
  health_loss_per_defeat?: InputMaybe<Scalars['Int']['input']>;
  health_per_feed?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  level_weight?: InputMaybe<Scalars['numeric']['input']>;
  max_health_per_level?: InputMaybe<Scalars['Int']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
  talent_weight?: InputMaybe<Scalars['numeric']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  upvote_weight?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate sum on columns */
export type Battle_Config_Sum_Fields = {
  __typename?: 'battle_config_sum_fields';
  exp_for_level_up_base?: Maybe<Scalars['Int']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['numeric']['output']>;
  exp_per_second?: Maybe<Scalars['Int']['output']>;
  exp_per_win?: Maybe<Scalars['Int']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Int']['output']>;
  health_per_feed?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  level_weight?: Maybe<Scalars['numeric']['output']>;
  max_health_per_level?: Maybe<Scalars['Int']['output']>;
  random_factor?: Maybe<Scalars['numeric']['output']>;
  talent_weight?: Maybe<Scalars['numeric']['output']>;
  upvote_weight?: Maybe<Scalars['numeric']['output']>;
};

/** update columns of table "battle_config" */
export enum Battle_Config_Update_Column {
  /** column name */
  ExpForLevelUpBase = 'exp_for_level_up_base',
  /** column name */
  ExpForLevelUpMultiplier = 'exp_for_level_up_multiplier',
  /** column name */
  ExpPerSecond = 'exp_per_second',
  /** column name */
  ExpPerWin = 'exp_per_win',
  /** column name */
  HealthLossPerDefeat = 'health_loss_per_defeat',
  /** column name */
  HealthPerFeed = 'health_per_feed',
  /** column name */
  Id = 'id',
  /** column name */
  LevelWeight = 'level_weight',
  /** column name */
  MaxHealthPerLevel = 'max_health_per_level',
  /** column name */
  RandomFactor = 'random_factor',
  /** column name */
  TalentWeight = 'talent_weight',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UpvoteWeight = 'upvote_weight'
}

export type Battle_Config_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Battle_Config_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Battle_Config_Set_Input>;
  /** filter the rows which have to be updated */
  where: Battle_Config_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Battle_Config_Var_Pop_Fields = {
  __typename?: 'battle_config_var_pop_fields';
  exp_for_level_up_base?: Maybe<Scalars['Float']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['Float']['output']>;
  exp_per_second?: Maybe<Scalars['Float']['output']>;
  exp_per_win?: Maybe<Scalars['Float']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Float']['output']>;
  health_per_feed?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  level_weight?: Maybe<Scalars['Float']['output']>;
  max_health_per_level?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
  talent_weight?: Maybe<Scalars['Float']['output']>;
  upvote_weight?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Battle_Config_Var_Samp_Fields = {
  __typename?: 'battle_config_var_samp_fields';
  exp_for_level_up_base?: Maybe<Scalars['Float']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['Float']['output']>;
  exp_per_second?: Maybe<Scalars['Float']['output']>;
  exp_per_win?: Maybe<Scalars['Float']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Float']['output']>;
  health_per_feed?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  level_weight?: Maybe<Scalars['Float']['output']>;
  max_health_per_level?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
  talent_weight?: Maybe<Scalars['Float']['output']>;
  upvote_weight?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Battle_Config_Variance_Fields = {
  __typename?: 'battle_config_variance_fields';
  exp_for_level_up_base?: Maybe<Scalars['Float']['output']>;
  exp_for_level_up_multiplier?: Maybe<Scalars['Float']['output']>;
  exp_per_second?: Maybe<Scalars['Float']['output']>;
  exp_per_win?: Maybe<Scalars['Float']['output']>;
  health_loss_per_defeat?: Maybe<Scalars['Float']['output']>;
  health_per_feed?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  level_weight?: Maybe<Scalars['Float']['output']>;
  max_health_per_level?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
  talent_weight?: Maybe<Scalars['Float']['output']>;
  upvote_weight?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "battle_fish" */
export type Battle_Fish = {
  __typename?: 'battle_fish';
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  is_alive?: Maybe<Scalars['Boolean']['output']>;
  is_approved?: Maybe<Scalars['Boolean']['output']>;
  is_in_battle_mode?: Maybe<Scalars['Boolean']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  reported?: Maybe<Scalars['Boolean']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "battle_fish" */
export type Battle_Fish_Aggregate = {
  __typename?: 'battle_fish_aggregate';
  aggregate?: Maybe<Battle_Fish_Aggregate_Fields>;
  nodes: Array<Battle_Fish>;
};

/** aggregate fields of "battle_fish" */
export type Battle_Fish_Aggregate_Fields = {
  __typename?: 'battle_fish_aggregate_fields';
  avg?: Maybe<Battle_Fish_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Battle_Fish_Max_Fields>;
  min?: Maybe<Battle_Fish_Min_Fields>;
  stddev?: Maybe<Battle_Fish_Stddev_Fields>;
  stddev_pop?: Maybe<Battle_Fish_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Battle_Fish_Stddev_Samp_Fields>;
  sum?: Maybe<Battle_Fish_Sum_Fields>;
  var_pop?: Maybe<Battle_Fish_Var_Pop_Fields>;
  var_samp?: Maybe<Battle_Fish_Var_Samp_Fields>;
  variance?: Maybe<Battle_Fish_Variance_Fields>;
};


/** aggregate fields of "battle_fish" */
export type Battle_Fish_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Battle_Fish_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Battle_Fish_Avg_Fields = {
  __typename?: 'battle_fish_avg_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "battle_fish". All fields are combined with a logical 'AND'. */
export type Battle_Fish_Bool_Exp = {
  _and?: InputMaybe<Array<Battle_Fish_Bool_Exp>>;
  _not?: InputMaybe<Battle_Fish_Bool_Exp>;
  _or?: InputMaybe<Array<Battle_Fish_Bool_Exp>>;
  artist?: InputMaybe<String_Comparison_Exp>;
  battle_power?: InputMaybe<Numeric_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  downvotes?: InputMaybe<Int_Comparison_Exp>;
  experience?: InputMaybe<Int_Comparison_Exp>;
  health?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image_url?: InputMaybe<String_Comparison_Exp>;
  is_alive?: InputMaybe<Boolean_Comparison_Exp>;
  is_approved?: InputMaybe<Boolean_Comparison_Exp>;
  is_in_battle_mode?: InputMaybe<Boolean_Comparison_Exp>;
  last_exp_update?: InputMaybe<Timestamp_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  max_health?: InputMaybe<Int_Comparison_Exp>;
  moderator_notes?: InputMaybe<String_Comparison_Exp>;
  position_row?: InputMaybe<Int_Comparison_Exp>;
  report_count?: InputMaybe<Int_Comparison_Exp>;
  reported?: InputMaybe<Boolean_Comparison_Exp>;
  score?: InputMaybe<Int_Comparison_Exp>;
  talent?: InputMaybe<Int_Comparison_Exp>;
  total_losses?: InputMaybe<Int_Comparison_Exp>;
  total_wins?: InputMaybe<Int_Comparison_Exp>;
  upvotes?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "battle_fish" */
export type Battle_Fish_Inc_Input = {
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "battle_fish" */
export type Battle_Fish_Insert_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Battle_Fish_Max_Fields = {
  __typename?: 'battle_fish_max_fields';
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Battle_Fish_Min_Fields = {
  __typename?: 'battle_fish_min_fields';
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "battle_fish" */
export type Battle_Fish_Mutation_Response = {
  __typename?: 'battle_fish_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Battle_Fish>;
};

/** Ordering options when selecting data from "battle_fish". */
export type Battle_Fish_Order_By = {
  artist?: InputMaybe<Order_By>;
  battle_power?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  downvotes?: InputMaybe<Order_By>;
  experience?: InputMaybe<Order_By>;
  health?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  is_alive?: InputMaybe<Order_By>;
  is_approved?: InputMaybe<Order_By>;
  is_in_battle_mode?: InputMaybe<Order_By>;
  last_exp_update?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  max_health?: InputMaybe<Order_By>;
  moderator_notes?: InputMaybe<Order_By>;
  position_row?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  reported?: InputMaybe<Order_By>;
  score?: InputMaybe<Order_By>;
  talent?: InputMaybe<Order_By>;
  total_losses?: InputMaybe<Order_By>;
  total_wins?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "battle_fish" */
export enum Battle_Fish_Select_Column {
  /** column name */
  Artist = 'artist',
  /** column name */
  BattlePower = 'battle_power',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Downvotes = 'downvotes',
  /** column name */
  Experience = 'experience',
  /** column name */
  Health = 'health',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'image_url',
  /** column name */
  IsAlive = 'is_alive',
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  IsInBattleMode = 'is_in_battle_mode',
  /** column name */
  LastExpUpdate = 'last_exp_update',
  /** column name */
  Level = 'level',
  /** column name */
  MaxHealth = 'max_health',
  /** column name */
  ModeratorNotes = 'moderator_notes',
  /** column name */
  PositionRow = 'position_row',
  /** column name */
  ReportCount = 'report_count',
  /** column name */
  Reported = 'reported',
  /** column name */
  Score = 'score',
  /** column name */
  Talent = 'talent',
  /** column name */
  TotalLosses = 'total_losses',
  /** column name */
  TotalWins = 'total_wins',
  /** column name */
  Upvotes = 'upvotes',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "battle_fish" */
export type Battle_Fish_Set_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Battle_Fish_Stddev_Fields = {
  __typename?: 'battle_fish_stddev_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Battle_Fish_Stddev_Pop_Fields = {
  __typename?: 'battle_fish_stddev_pop_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Battle_Fish_Stddev_Samp_Fields = {
  __typename?: 'battle_fish_stddev_samp_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "battle_fish" */
export type Battle_Fish_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Battle_Fish_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Battle_Fish_Stream_Cursor_Value_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Battle_Fish_Sum_Fields = {
  __typename?: 'battle_fish_sum_fields';
  battle_power?: Maybe<Scalars['numeric']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
};

export type Battle_Fish_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Battle_Fish_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Battle_Fish_Set_Input>;
  /** filter the rows which have to be updated */
  where: Battle_Fish_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Battle_Fish_Var_Pop_Fields = {
  __typename?: 'battle_fish_var_pop_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Battle_Fish_Var_Samp_Fields = {
  __typename?: 'battle_fish_var_samp_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Battle_Fish_Variance_Fields = {
  __typename?: 'battle_fish_variance_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "battle_log" */
export type Battle_Log = {
  __typename?: 'battle_log';
  attacker_id?: Maybe<Scalars['uuid']['output']>;
  attacker_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  defender_id?: Maybe<Scalars['uuid']['output']>;
  defender_power?: Maybe<Scalars['numeric']['output']>;
  exp_gained?: Maybe<Scalars['Int']['output']>;
  health_lost?: Maybe<Scalars['Int']['output']>;
  id: Scalars['uuid']['output'];
  random_factor?: Maybe<Scalars['numeric']['output']>;
  winner_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregated selection of "battle_log" */
export type Battle_Log_Aggregate = {
  __typename?: 'battle_log_aggregate';
  aggregate?: Maybe<Battle_Log_Aggregate_Fields>;
  nodes: Array<Battle_Log>;
};

/** aggregate fields of "battle_log" */
export type Battle_Log_Aggregate_Fields = {
  __typename?: 'battle_log_aggregate_fields';
  avg?: Maybe<Battle_Log_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Battle_Log_Max_Fields>;
  min?: Maybe<Battle_Log_Min_Fields>;
  stddev?: Maybe<Battle_Log_Stddev_Fields>;
  stddev_pop?: Maybe<Battle_Log_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Battle_Log_Stddev_Samp_Fields>;
  sum?: Maybe<Battle_Log_Sum_Fields>;
  var_pop?: Maybe<Battle_Log_Var_Pop_Fields>;
  var_samp?: Maybe<Battle_Log_Var_Samp_Fields>;
  variance?: Maybe<Battle_Log_Variance_Fields>;
};


/** aggregate fields of "battle_log" */
export type Battle_Log_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Battle_Log_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Battle_Log_Avg_Fields = {
  __typename?: 'battle_log_avg_fields';
  attacker_power?: Maybe<Scalars['Float']['output']>;
  defender_power?: Maybe<Scalars['Float']['output']>;
  exp_gained?: Maybe<Scalars['Float']['output']>;
  health_lost?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "battle_log". All fields are combined with a logical 'AND'. */
export type Battle_Log_Bool_Exp = {
  _and?: InputMaybe<Array<Battle_Log_Bool_Exp>>;
  _not?: InputMaybe<Battle_Log_Bool_Exp>;
  _or?: InputMaybe<Array<Battle_Log_Bool_Exp>>;
  attacker_id?: InputMaybe<Uuid_Comparison_Exp>;
  attacker_power?: InputMaybe<Numeric_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  defender_id?: InputMaybe<Uuid_Comparison_Exp>;
  defender_power?: InputMaybe<Numeric_Comparison_Exp>;
  exp_gained?: InputMaybe<Int_Comparison_Exp>;
  health_lost?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  random_factor?: InputMaybe<Numeric_Comparison_Exp>;
  winner_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "battle_log" */
export enum Battle_Log_Constraint {
  /** unique or primary key constraint on columns "id" */
  BattleLogPkey = 'battle_log_pkey'
}

/** input type for incrementing numeric columns in table "battle_log" */
export type Battle_Log_Inc_Input = {
  attacker_power?: InputMaybe<Scalars['numeric']['input']>;
  defender_power?: InputMaybe<Scalars['numeric']['input']>;
  exp_gained?: InputMaybe<Scalars['Int']['input']>;
  health_lost?: InputMaybe<Scalars['Int']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "battle_log" */
export type Battle_Log_Insert_Input = {
  attacker_id?: InputMaybe<Scalars['uuid']['input']>;
  attacker_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  defender_id?: InputMaybe<Scalars['uuid']['input']>;
  defender_power?: InputMaybe<Scalars['numeric']['input']>;
  exp_gained?: InputMaybe<Scalars['Int']['input']>;
  health_lost?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
  winner_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Battle_Log_Max_Fields = {
  __typename?: 'battle_log_max_fields';
  attacker_id?: Maybe<Scalars['uuid']['output']>;
  attacker_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  defender_id?: Maybe<Scalars['uuid']['output']>;
  defender_power?: Maybe<Scalars['numeric']['output']>;
  exp_gained?: Maybe<Scalars['Int']['output']>;
  health_lost?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  random_factor?: Maybe<Scalars['numeric']['output']>;
  winner_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Battle_Log_Min_Fields = {
  __typename?: 'battle_log_min_fields';
  attacker_id?: Maybe<Scalars['uuid']['output']>;
  attacker_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  defender_id?: Maybe<Scalars['uuid']['output']>;
  defender_power?: Maybe<Scalars['numeric']['output']>;
  exp_gained?: Maybe<Scalars['Int']['output']>;
  health_lost?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  random_factor?: Maybe<Scalars['numeric']['output']>;
  winner_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "battle_log" */
export type Battle_Log_Mutation_Response = {
  __typename?: 'battle_log_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Battle_Log>;
};

/** on_conflict condition type for table "battle_log" */
export type Battle_Log_On_Conflict = {
  constraint: Battle_Log_Constraint;
  update_columns?: Array<Battle_Log_Update_Column>;
  where?: InputMaybe<Battle_Log_Bool_Exp>;
};

/** Ordering options when selecting data from "battle_log". */
export type Battle_Log_Order_By = {
  attacker_id?: InputMaybe<Order_By>;
  attacker_power?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  defender_id?: InputMaybe<Order_By>;
  defender_power?: InputMaybe<Order_By>;
  exp_gained?: InputMaybe<Order_By>;
  health_lost?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  random_factor?: InputMaybe<Order_By>;
  winner_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: battle_log */
export type Battle_Log_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "battle_log" */
export enum Battle_Log_Select_Column {
  /** column name */
  AttackerId = 'attacker_id',
  /** column name */
  AttackerPower = 'attacker_power',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DefenderId = 'defender_id',
  /** column name */
  DefenderPower = 'defender_power',
  /** column name */
  ExpGained = 'exp_gained',
  /** column name */
  HealthLost = 'health_lost',
  /** column name */
  Id = 'id',
  /** column name */
  RandomFactor = 'random_factor',
  /** column name */
  WinnerId = 'winner_id'
}

/** input type for updating data in table "battle_log" */
export type Battle_Log_Set_Input = {
  attacker_id?: InputMaybe<Scalars['uuid']['input']>;
  attacker_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  defender_id?: InputMaybe<Scalars['uuid']['input']>;
  defender_power?: InputMaybe<Scalars['numeric']['input']>;
  exp_gained?: InputMaybe<Scalars['Int']['input']>;
  health_lost?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
  winner_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Battle_Log_Stddev_Fields = {
  __typename?: 'battle_log_stddev_fields';
  attacker_power?: Maybe<Scalars['Float']['output']>;
  defender_power?: Maybe<Scalars['Float']['output']>;
  exp_gained?: Maybe<Scalars['Float']['output']>;
  health_lost?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Battle_Log_Stddev_Pop_Fields = {
  __typename?: 'battle_log_stddev_pop_fields';
  attacker_power?: Maybe<Scalars['Float']['output']>;
  defender_power?: Maybe<Scalars['Float']['output']>;
  exp_gained?: Maybe<Scalars['Float']['output']>;
  health_lost?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Battle_Log_Stddev_Samp_Fields = {
  __typename?: 'battle_log_stddev_samp_fields';
  attacker_power?: Maybe<Scalars['Float']['output']>;
  defender_power?: Maybe<Scalars['Float']['output']>;
  exp_gained?: Maybe<Scalars['Float']['output']>;
  health_lost?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "battle_log" */
export type Battle_Log_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Battle_Log_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Battle_Log_Stream_Cursor_Value_Input = {
  attacker_id?: InputMaybe<Scalars['uuid']['input']>;
  attacker_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  defender_id?: InputMaybe<Scalars['uuid']['input']>;
  defender_power?: InputMaybe<Scalars['numeric']['input']>;
  exp_gained?: InputMaybe<Scalars['Int']['input']>;
  health_lost?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  random_factor?: InputMaybe<Scalars['numeric']['input']>;
  winner_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Battle_Log_Sum_Fields = {
  __typename?: 'battle_log_sum_fields';
  attacker_power?: Maybe<Scalars['numeric']['output']>;
  defender_power?: Maybe<Scalars['numeric']['output']>;
  exp_gained?: Maybe<Scalars['Int']['output']>;
  health_lost?: Maybe<Scalars['Int']['output']>;
  random_factor?: Maybe<Scalars['numeric']['output']>;
};

/** update columns of table "battle_log" */
export enum Battle_Log_Update_Column {
  /** column name */
  AttackerId = 'attacker_id',
  /** column name */
  AttackerPower = 'attacker_power',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DefenderId = 'defender_id',
  /** column name */
  DefenderPower = 'defender_power',
  /** column name */
  ExpGained = 'exp_gained',
  /** column name */
  HealthLost = 'health_lost',
  /** column name */
  Id = 'id',
  /** column name */
  RandomFactor = 'random_factor',
  /** column name */
  WinnerId = 'winner_id'
}

export type Battle_Log_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Battle_Log_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Battle_Log_Set_Input>;
  /** filter the rows which have to be updated */
  where: Battle_Log_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Battle_Log_Var_Pop_Fields = {
  __typename?: 'battle_log_var_pop_fields';
  attacker_power?: Maybe<Scalars['Float']['output']>;
  defender_power?: Maybe<Scalars['Float']['output']>;
  exp_gained?: Maybe<Scalars['Float']['output']>;
  health_lost?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Battle_Log_Var_Samp_Fields = {
  __typename?: 'battle_log_var_samp_fields';
  attacker_power?: Maybe<Scalars['Float']['output']>;
  defender_power?: Maybe<Scalars['Float']['output']>;
  exp_gained?: Maybe<Scalars['Float']['output']>;
  health_lost?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Battle_Log_Variance_Fields = {
  __typename?: 'battle_log_variance_fields';
  attacker_power?: Maybe<Scalars['Float']['output']>;
  defender_power?: Maybe<Scalars['Float']['output']>;
  exp_gained?: Maybe<Scalars['Float']['output']>;
  health_lost?: Maybe<Scalars['Float']['output']>;
  random_factor?: Maybe<Scalars['Float']['output']>;
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

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** columns and relationships of "economy_log" */
export type Economy_Log = {
  __typename?: 'economy_log';
  action: Scalars['String']['output'];
  amount: Scalars['Int']['output'];
  balance_after: Scalars['Int']['output'];
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id: Scalars['uuid']['output'];
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "economy_log" */
export type Economy_Log_Aggregate = {
  __typename?: 'economy_log_aggregate';
  aggregate?: Maybe<Economy_Log_Aggregate_Fields>;
  nodes: Array<Economy_Log>;
};

/** aggregate fields of "economy_log" */
export type Economy_Log_Aggregate_Fields = {
  __typename?: 'economy_log_aggregate_fields';
  avg?: Maybe<Economy_Log_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Economy_Log_Max_Fields>;
  min?: Maybe<Economy_Log_Min_Fields>;
  stddev?: Maybe<Economy_Log_Stddev_Fields>;
  stddev_pop?: Maybe<Economy_Log_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Economy_Log_Stddev_Samp_Fields>;
  sum?: Maybe<Economy_Log_Sum_Fields>;
  var_pop?: Maybe<Economy_Log_Var_Pop_Fields>;
  var_samp?: Maybe<Economy_Log_Var_Samp_Fields>;
  variance?: Maybe<Economy_Log_Variance_Fields>;
};


/** aggregate fields of "economy_log" */
export type Economy_Log_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Economy_Log_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Economy_Log_Avg_Fields = {
  __typename?: 'economy_log_avg_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "economy_log". All fields are combined with a logical 'AND'. */
export type Economy_Log_Bool_Exp = {
  _and?: InputMaybe<Array<Economy_Log_Bool_Exp>>;
  _not?: InputMaybe<Economy_Log_Bool_Exp>;
  _or?: InputMaybe<Array<Economy_Log_Bool_Exp>>;
  action?: InputMaybe<String_Comparison_Exp>;
  amount?: InputMaybe<Int_Comparison_Exp>;
  balance_after?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "economy_log" */
export enum Economy_Log_Constraint {
  /** unique or primary key constraint on columns "id" */
  EconomyLogPkey = 'economy_log_pkey'
}

/** input type for incrementing numeric columns in table "economy_log" */
export type Economy_Log_Inc_Input = {
  amount?: InputMaybe<Scalars['Int']['input']>;
  balance_after?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "economy_log" */
export type Economy_Log_Insert_Input = {
  action?: InputMaybe<Scalars['String']['input']>;
  amount?: InputMaybe<Scalars['Int']['input']>;
  balance_after?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Economy_Log_Max_Fields = {
  __typename?: 'economy_log_max_fields';
  action?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['Int']['output']>;
  balance_after?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Economy_Log_Min_Fields = {
  __typename?: 'economy_log_min_fields';
  action?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['Int']['output']>;
  balance_after?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "economy_log" */
export type Economy_Log_Mutation_Response = {
  __typename?: 'economy_log_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Economy_Log>;
};

/** on_conflict condition type for table "economy_log" */
export type Economy_Log_On_Conflict = {
  constraint: Economy_Log_Constraint;
  update_columns?: Array<Economy_Log_Update_Column>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
};

/** Ordering options when selecting data from "economy_log". */
export type Economy_Log_Order_By = {
  action?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: economy_log */
export type Economy_Log_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "economy_log" */
export enum Economy_Log_Select_Column {
  /** column name */
  Action = 'action',
  /** column name */
  Amount = 'amount',
  /** column name */
  BalanceAfter = 'balance_after',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "economy_log" */
export type Economy_Log_Set_Input = {
  action?: InputMaybe<Scalars['String']['input']>;
  amount?: InputMaybe<Scalars['Int']['input']>;
  balance_after?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Economy_Log_Stddev_Fields = {
  __typename?: 'economy_log_stddev_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Economy_Log_Stddev_Pop_Fields = {
  __typename?: 'economy_log_stddev_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Economy_Log_Stddev_Samp_Fields = {
  __typename?: 'economy_log_stddev_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "economy_log" */
export type Economy_Log_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Economy_Log_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Economy_Log_Stream_Cursor_Value_Input = {
  action?: InputMaybe<Scalars['String']['input']>;
  amount?: InputMaybe<Scalars['Int']['input']>;
  balance_after?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Economy_Log_Sum_Fields = {
  __typename?: 'economy_log_sum_fields';
  amount?: Maybe<Scalars['Int']['output']>;
  balance_after?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "economy_log" */
export enum Economy_Log_Update_Column {
  /** column name */
  Action = 'action',
  /** column name */
  Amount = 'amount',
  /** column name */
  BalanceAfter = 'balance_after',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishId = 'fish_id',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id'
}

export type Economy_Log_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Economy_Log_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Economy_Log_Set_Input>;
  /** filter the rows which have to be updated */
  where: Economy_Log_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Economy_Log_Var_Pop_Fields = {
  __typename?: 'economy_log_var_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Economy_Log_Var_Samp_Fields = {
  __typename?: 'economy_log_var_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Economy_Log_Variance_Fields = {
  __typename?: 'economy_log_variance_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "fish" */
export type Fish = {
  __typename?: 'fish';
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes: Scalars['Int']['output'];
  experience: Scalars['Int']['output'];
  health: Scalars['Int']['output'];
  id: Scalars['uuid']['output'];
  image_url: Scalars['String']['output'];
  is_alive?: Maybe<Scalars['Boolean']['output']>;
  is_approved?: Maybe<Scalars['Boolean']['output']>;
  is_in_battle_mode?: Maybe<Scalars['Boolean']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level: Scalars['Int']['output'];
  max_health: Scalars['Int']['output'];
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  reported?: Maybe<Scalars['Boolean']['output']>;
  talent: Scalars['Int']['output'];
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes: Scalars['Int']['output'];
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "fish" */
export type Fish_Aggregate = {
  __typename?: 'fish_aggregate';
  aggregate?: Maybe<Fish_Aggregate_Fields>;
  nodes: Array<Fish>;
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

/** aggregate avg on columns */
export type Fish_Avg_Fields = {
  __typename?: 'fish_avg_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "fish". All fields are combined with a logical 'AND'. */
export type Fish_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_Bool_Exp>>;
  _not?: InputMaybe<Fish_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_Bool_Exp>>;
  artist?: InputMaybe<String_Comparison_Exp>;
  battle_power?: InputMaybe<Numeric_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  downvotes?: InputMaybe<Int_Comparison_Exp>;
  experience?: InputMaybe<Int_Comparison_Exp>;
  health?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image_url?: InputMaybe<String_Comparison_Exp>;
  is_alive?: InputMaybe<Boolean_Comparison_Exp>;
  is_approved?: InputMaybe<Boolean_Comparison_Exp>;
  is_in_battle_mode?: InputMaybe<Boolean_Comparison_Exp>;
  last_exp_update?: InputMaybe<Timestamp_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  max_health?: InputMaybe<Int_Comparison_Exp>;
  moderator_notes?: InputMaybe<String_Comparison_Exp>;
  position_row?: InputMaybe<Int_Comparison_Exp>;
  report_count?: InputMaybe<Int_Comparison_Exp>;
  reported?: InputMaybe<Boolean_Comparison_Exp>;
  talent?: InputMaybe<Int_Comparison_Exp>;
  total_losses?: InputMaybe<Int_Comparison_Exp>;
  total_wins?: InputMaybe<Int_Comparison_Exp>;
  upvotes?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "fish" */
export enum Fish_Constraint {
  /** unique or primary key constraint on columns "id" */
  FishPkey = 'fish_pkey'
}

/** input type for incrementing numeric columns in table "fish" */
export type Fish_Inc_Input = {
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "fish" */
export type Fish_Insert_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Fish_Max_Fields = {
  __typename?: 'fish_max_fields';
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Fish_Min_Fields = {
  __typename?: 'fish_min_fields';
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "fish" */
export type Fish_Mutation_Response = {
  __typename?: 'fish_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Fish>;
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
  battle_power?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  downvotes?: InputMaybe<Order_By>;
  experience?: InputMaybe<Order_By>;
  health?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  is_alive?: InputMaybe<Order_By>;
  is_approved?: InputMaybe<Order_By>;
  is_in_battle_mode?: InputMaybe<Order_By>;
  last_exp_update?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  max_health?: InputMaybe<Order_By>;
  moderator_notes?: InputMaybe<Order_By>;
  position_row?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  reported?: InputMaybe<Order_By>;
  talent?: InputMaybe<Order_By>;
  total_losses?: InputMaybe<Order_By>;
  total_wins?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  BattlePower = 'battle_power',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Downvotes = 'downvotes',
  /** column name */
  Experience = 'experience',
  /** column name */
  Health = 'health',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'image_url',
  /** column name */
  IsAlive = 'is_alive',
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  IsInBattleMode = 'is_in_battle_mode',
  /** column name */
  LastExpUpdate = 'last_exp_update',
  /** column name */
  Level = 'level',
  /** column name */
  MaxHealth = 'max_health',
  /** column name */
  ModeratorNotes = 'moderator_notes',
  /** column name */
  PositionRow = 'position_row',
  /** column name */
  ReportCount = 'report_count',
  /** column name */
  Reported = 'reported',
  /** column name */
  Talent = 'talent',
  /** column name */
  TotalLosses = 'total_losses',
  /** column name */
  TotalWins = 'total_wins',
  /** column name */
  Upvotes = 'upvotes',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "fish" */
export type Fish_Set_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Fish_Stddev_Fields = {
  __typename?: 'fish_stddev_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Fish_Stddev_Pop_Fields = {
  __typename?: 'fish_stddev_pop_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Fish_Stddev_Samp_Fields = {
  __typename?: 'fish_stddev_samp_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
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
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Fish_Sum_Fields = {
  __typename?: 'fish_sum_fields';
  battle_power?: Maybe<Scalars['numeric']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "fish" */
export enum Fish_Update_Column {
  /** column name */
  Artist = 'artist',
  /** column name */
  BattlePower = 'battle_power',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Downvotes = 'downvotes',
  /** column name */
  Experience = 'experience',
  /** column name */
  Health = 'health',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'image_url',
  /** column name */
  IsAlive = 'is_alive',
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  IsInBattleMode = 'is_in_battle_mode',
  /** column name */
  LastExpUpdate = 'last_exp_update',
  /** column name */
  Level = 'level',
  /** column name */
  MaxHealth = 'max_health',
  /** column name */
  ModeratorNotes = 'moderator_notes',
  /** column name */
  PositionRow = 'position_row',
  /** column name */
  ReportCount = 'report_count',
  /** column name */
  Reported = 'reported',
  /** column name */
  Talent = 'talent',
  /** column name */
  TotalLosses = 'total_losses',
  /** column name */
  TotalWins = 'total_wins',
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
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Fish_Var_Samp_Fields = {
  __typename?: 'fish_var_samp_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Fish_Variance_Fields = {
  __typename?: 'fish_variance_fields';
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "fish_with_scores" */
export type Fish_With_Scores = {
  __typename?: 'fish_with_scores';
  approval_rate?: Maybe<Scalars['float8']['output']>;
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  is_alive?: Maybe<Scalars['Boolean']['output']>;
  is_approved?: Maybe<Scalars['Boolean']['output']>;
  is_in_battle_mode?: Maybe<Scalars['Boolean']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  reported?: Maybe<Scalars['Boolean']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "fish_with_scores" */
export type Fish_With_Scores_Aggregate = {
  __typename?: 'fish_with_scores_aggregate';
  aggregate?: Maybe<Fish_With_Scores_Aggregate_Fields>;
  nodes: Array<Fish_With_Scores>;
};

/** aggregate fields of "fish_with_scores" */
export type Fish_With_Scores_Aggregate_Fields = {
  __typename?: 'fish_with_scores_aggregate_fields';
  avg?: Maybe<Fish_With_Scores_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Fish_With_Scores_Max_Fields>;
  min?: Maybe<Fish_With_Scores_Min_Fields>;
  stddev?: Maybe<Fish_With_Scores_Stddev_Fields>;
  stddev_pop?: Maybe<Fish_With_Scores_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Fish_With_Scores_Stddev_Samp_Fields>;
  sum?: Maybe<Fish_With_Scores_Sum_Fields>;
  var_pop?: Maybe<Fish_With_Scores_Var_Pop_Fields>;
  var_samp?: Maybe<Fish_With_Scores_Var_Samp_Fields>;
  variance?: Maybe<Fish_With_Scores_Variance_Fields>;
};


/** aggregate fields of "fish_with_scores" */
export type Fish_With_Scores_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Fish_With_Scores_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Fish_With_Scores_Avg_Fields = {
  __typename?: 'fish_with_scores_avg_fields';
  approval_rate?: Maybe<Scalars['Float']['output']>;
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "fish_with_scores". All fields are combined with a logical 'AND'. */
export type Fish_With_Scores_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_With_Scores_Bool_Exp>>;
  _not?: InputMaybe<Fish_With_Scores_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_With_Scores_Bool_Exp>>;
  approval_rate?: InputMaybe<Float8_Comparison_Exp>;
  artist?: InputMaybe<String_Comparison_Exp>;
  battle_power?: InputMaybe<Numeric_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  downvotes?: InputMaybe<Int_Comparison_Exp>;
  experience?: InputMaybe<Int_Comparison_Exp>;
  health?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image_url?: InputMaybe<String_Comparison_Exp>;
  is_alive?: InputMaybe<Boolean_Comparison_Exp>;
  is_approved?: InputMaybe<Boolean_Comparison_Exp>;
  is_in_battle_mode?: InputMaybe<Boolean_Comparison_Exp>;
  last_exp_update?: InputMaybe<Timestamp_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  max_health?: InputMaybe<Int_Comparison_Exp>;
  moderator_notes?: InputMaybe<String_Comparison_Exp>;
  position_row?: InputMaybe<Int_Comparison_Exp>;
  report_count?: InputMaybe<Int_Comparison_Exp>;
  reported?: InputMaybe<Boolean_Comparison_Exp>;
  score?: InputMaybe<Int_Comparison_Exp>;
  talent?: InputMaybe<Int_Comparison_Exp>;
  total_losses?: InputMaybe<Int_Comparison_Exp>;
  total_wins?: InputMaybe<Int_Comparison_Exp>;
  upvotes?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "fish_with_scores" */
export type Fish_With_Scores_Inc_Input = {
  approval_rate?: InputMaybe<Scalars['float8']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "fish_with_scores" */
export type Fish_With_Scores_Insert_Input = {
  approval_rate?: InputMaybe<Scalars['float8']['input']>;
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Fish_With_Scores_Max_Fields = {
  __typename?: 'fish_with_scores_max_fields';
  approval_rate?: Maybe<Scalars['float8']['output']>;
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Fish_With_Scores_Min_Fields = {
  __typename?: 'fish_with_scores_min_fields';
  approval_rate?: Maybe<Scalars['float8']['output']>;
  artist?: Maybe<Scalars['String']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "fish_with_scores" */
export type Fish_With_Scores_Mutation_Response = {
  __typename?: 'fish_with_scores_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Fish_With_Scores>;
};

/** Ordering options when selecting data from "fish_with_scores". */
export type Fish_With_Scores_Order_By = {
  approval_rate?: InputMaybe<Order_By>;
  artist?: InputMaybe<Order_By>;
  battle_power?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  downvotes?: InputMaybe<Order_By>;
  experience?: InputMaybe<Order_By>;
  health?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  is_alive?: InputMaybe<Order_By>;
  is_approved?: InputMaybe<Order_By>;
  is_in_battle_mode?: InputMaybe<Order_By>;
  last_exp_update?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  max_health?: InputMaybe<Order_By>;
  moderator_notes?: InputMaybe<Order_By>;
  position_row?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  reported?: InputMaybe<Order_By>;
  score?: InputMaybe<Order_By>;
  talent?: InputMaybe<Order_By>;
  total_losses?: InputMaybe<Order_By>;
  total_wins?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "fish_with_scores" */
export enum Fish_With_Scores_Select_Column {
  /** column name */
  ApprovalRate = 'approval_rate',
  /** column name */
  Artist = 'artist',
  /** column name */
  BattlePower = 'battle_power',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Downvotes = 'downvotes',
  /** column name */
  Experience = 'experience',
  /** column name */
  Health = 'health',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'image_url',
  /** column name */
  IsAlive = 'is_alive',
  /** column name */
  IsApproved = 'is_approved',
  /** column name */
  IsInBattleMode = 'is_in_battle_mode',
  /** column name */
  LastExpUpdate = 'last_exp_update',
  /** column name */
  Level = 'level',
  /** column name */
  MaxHealth = 'max_health',
  /** column name */
  ModeratorNotes = 'moderator_notes',
  /** column name */
  PositionRow = 'position_row',
  /** column name */
  ReportCount = 'report_count',
  /** column name */
  Reported = 'reported',
  /** column name */
  Score = 'score',
  /** column name */
  Talent = 'talent',
  /** column name */
  TotalLosses = 'total_losses',
  /** column name */
  TotalWins = 'total_wins',
  /** column name */
  Upvotes = 'upvotes',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "fish_with_scores" */
export type Fish_With_Scores_Set_Input = {
  approval_rate?: InputMaybe<Scalars['float8']['input']>;
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Fish_With_Scores_Stddev_Fields = {
  __typename?: 'fish_with_scores_stddev_fields';
  approval_rate?: Maybe<Scalars['Float']['output']>;
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Fish_With_Scores_Stddev_Pop_Fields = {
  __typename?: 'fish_with_scores_stddev_pop_fields';
  approval_rate?: Maybe<Scalars['Float']['output']>;
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Fish_With_Scores_Stddev_Samp_Fields = {
  __typename?: 'fish_with_scores_stddev_samp_fields';
  approval_rate?: Maybe<Scalars['Float']['output']>;
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "fish_with_scores" */
export type Fish_With_Scores_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Fish_With_Scores_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Fish_With_Scores_Stream_Cursor_Value_Input = {
  approval_rate?: InputMaybe<Scalars['float8']['input']>;
  artist?: InputMaybe<Scalars['String']['input']>;
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_alive?: InputMaybe<Scalars['Boolean']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  is_in_battle_mode?: InputMaybe<Scalars['Boolean']['input']>;
  last_exp_update?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  moderator_notes?: InputMaybe<Scalars['String']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Fish_With_Scores_Sum_Fields = {
  __typename?: 'fish_with_scores_sum_fields';
  approval_rate?: Maybe<Scalars['float8']['output']>;
  battle_power?: Maybe<Scalars['numeric']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
};

export type Fish_With_Scores_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Fish_With_Scores_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Fish_With_Scores_Set_Input>;
  /** filter the rows which have to be updated */
  where: Fish_With_Scores_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Fish_With_Scores_Var_Pop_Fields = {
  __typename?: 'fish_with_scores_var_pop_fields';
  approval_rate?: Maybe<Scalars['Float']['output']>;
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Fish_With_Scores_Var_Samp_Fields = {
  __typename?: 'fish_with_scores_var_samp_fields';
  approval_rate?: Maybe<Scalars['Float']['output']>;
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Fish_With_Scores_Variance_Fields = {
  __typename?: 'fish_with_scores_variance_fields';
  approval_rate?: Maybe<Scalars['Float']['output']>;
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to compare columns of type "float8". All fields are combined with logical 'AND'. */
export type Float8_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['float8']['input']>;
  _gt?: InputMaybe<Scalars['float8']['input']>;
  _gte?: InputMaybe<Scalars['float8']['input']>;
  _in?: InputMaybe<Array<Scalars['float8']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['float8']['input']>;
  _lte?: InputMaybe<Scalars['float8']['input']>;
  _neq?: InputMaybe<Scalars['float8']['input']>;
  _nin?: InputMaybe<Array<Scalars['float8']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "battle_config" */
  delete_battle_config?: Maybe<Battle_Config_Mutation_Response>;
  /** delete single row from the table: "battle_config" */
  delete_battle_config_by_pk?: Maybe<Battle_Config>;
  /** delete data from the table: "battle_fish" */
  delete_battle_fish?: Maybe<Battle_Fish_Mutation_Response>;
  /** delete data from the table: "battle_log" */
  delete_battle_log?: Maybe<Battle_Log_Mutation_Response>;
  /** delete single row from the table: "battle_log" */
  delete_battle_log_by_pk?: Maybe<Battle_Log>;
  /** delete data from the table: "economy_log" */
  delete_economy_log?: Maybe<Economy_Log_Mutation_Response>;
  /** delete single row from the table: "economy_log" */
  delete_economy_log_by_pk?: Maybe<Economy_Log>;
  /** delete data from the table: "fish" */
  delete_fish?: Maybe<Fish_Mutation_Response>;
  /** delete single row from the table: "fish" */
  delete_fish_by_pk?: Maybe<Fish>;
  /** delete data from the table: "fish_with_scores" */
  delete_fish_with_scores?: Maybe<Fish_With_Scores_Mutation_Response>;
  /** delete data from the table: "reports" */
  delete_reports?: Maybe<Reports_Mutation_Response>;
  /** delete single row from the table: "reports" */
  delete_reports_by_pk?: Maybe<Reports>;
  /** delete data from the table: "user_economy" */
  delete_user_economy?: Maybe<User_Economy_Mutation_Response>;
  /** delete single row from the table: "user_economy" */
  delete_user_economy_by_pk?: Maybe<User_Economy>;
  /** delete data from the table: "votes" */
  delete_votes?: Maybe<Votes_Mutation_Response>;
  /** delete single row from the table: "votes" */
  delete_votes_by_pk?: Maybe<Votes>;
  /** insert data into the table: "battle_config" */
  insert_battle_config?: Maybe<Battle_Config_Mutation_Response>;
  /** insert a single row into the table: "battle_config" */
  insert_battle_config_one?: Maybe<Battle_Config>;
  /** insert data into the table: "battle_fish" */
  insert_battle_fish?: Maybe<Battle_Fish_Mutation_Response>;
  /** insert a single row into the table: "battle_fish" */
  insert_battle_fish_one?: Maybe<Battle_Fish>;
  /** insert data into the table: "battle_log" */
  insert_battle_log?: Maybe<Battle_Log_Mutation_Response>;
  /** insert a single row into the table: "battle_log" */
  insert_battle_log_one?: Maybe<Battle_Log>;
  /** insert data into the table: "economy_log" */
  insert_economy_log?: Maybe<Economy_Log_Mutation_Response>;
  /** insert a single row into the table: "economy_log" */
  insert_economy_log_one?: Maybe<Economy_Log>;
  /** insert data into the table: "fish" */
  insert_fish?: Maybe<Fish_Mutation_Response>;
  /** insert a single row into the table: "fish" */
  insert_fish_one?: Maybe<Fish>;
  /** insert data into the table: "fish_with_scores" */
  insert_fish_with_scores?: Maybe<Fish_With_Scores_Mutation_Response>;
  /** insert a single row into the table: "fish_with_scores" */
  insert_fish_with_scores_one?: Maybe<Fish_With_Scores>;
  /** insert data into the table: "reports" */
  insert_reports?: Maybe<Reports_Mutation_Response>;
  /** insert a single row into the table: "reports" */
  insert_reports_one?: Maybe<Reports>;
  /** insert data into the table: "user_economy" */
  insert_user_economy?: Maybe<User_Economy_Mutation_Response>;
  /** insert a single row into the table: "user_economy" */
  insert_user_economy_one?: Maybe<User_Economy>;
  /** insert data into the table: "votes" */
  insert_votes?: Maybe<Votes_Mutation_Response>;
  /** insert a single row into the table: "votes" */
  insert_votes_one?: Maybe<Votes>;
  /** update data of the table: "battle_config" */
  update_battle_config?: Maybe<Battle_Config_Mutation_Response>;
  /** update single row of the table: "battle_config" */
  update_battle_config_by_pk?: Maybe<Battle_Config>;
  /** update multiples rows of table: "battle_config" */
  update_battle_config_many?: Maybe<Array<Maybe<Battle_Config_Mutation_Response>>>;
  /** update data of the table: "battle_fish" */
  update_battle_fish?: Maybe<Battle_Fish_Mutation_Response>;
  /** update multiples rows of table: "battle_fish" */
  update_battle_fish_many?: Maybe<Array<Maybe<Battle_Fish_Mutation_Response>>>;
  /** update data of the table: "battle_log" */
  update_battle_log?: Maybe<Battle_Log_Mutation_Response>;
  /** update single row of the table: "battle_log" */
  update_battle_log_by_pk?: Maybe<Battle_Log>;
  /** update multiples rows of table: "battle_log" */
  update_battle_log_many?: Maybe<Array<Maybe<Battle_Log_Mutation_Response>>>;
  /** update data of the table: "economy_log" */
  update_economy_log?: Maybe<Economy_Log_Mutation_Response>;
  /** update single row of the table: "economy_log" */
  update_economy_log_by_pk?: Maybe<Economy_Log>;
  /** update multiples rows of table: "economy_log" */
  update_economy_log_many?: Maybe<Array<Maybe<Economy_Log_Mutation_Response>>>;
  /** update data of the table: "fish" */
  update_fish?: Maybe<Fish_Mutation_Response>;
  /** update single row of the table: "fish" */
  update_fish_by_pk?: Maybe<Fish>;
  /** update multiples rows of table: "fish" */
  update_fish_many?: Maybe<Array<Maybe<Fish_Mutation_Response>>>;
  /** update data of the table: "fish_with_scores" */
  update_fish_with_scores?: Maybe<Fish_With_Scores_Mutation_Response>;
  /** update multiples rows of table: "fish_with_scores" */
  update_fish_with_scores_many?: Maybe<Array<Maybe<Fish_With_Scores_Mutation_Response>>>;
  /** update data of the table: "reports" */
  update_reports?: Maybe<Reports_Mutation_Response>;
  /** update single row of the table: "reports" */
  update_reports_by_pk?: Maybe<Reports>;
  /** update multiples rows of table: "reports" */
  update_reports_many?: Maybe<Array<Maybe<Reports_Mutation_Response>>>;
  /** update data of the table: "user_economy" */
  update_user_economy?: Maybe<User_Economy_Mutation_Response>;
  /** update single row of the table: "user_economy" */
  update_user_economy_by_pk?: Maybe<User_Economy>;
  /** update multiples rows of table: "user_economy" */
  update_user_economy_many?: Maybe<Array<Maybe<User_Economy_Mutation_Response>>>;
  /** update data of the table: "votes" */
  update_votes?: Maybe<Votes_Mutation_Response>;
  /** update single row of the table: "votes" */
  update_votes_by_pk?: Maybe<Votes>;
  /** update multiples rows of table: "votes" */
  update_votes_many?: Maybe<Array<Maybe<Votes_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Battle_ConfigArgs = {
  where: Battle_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Battle_Config_By_PkArgs = {
  id: Scalars['Int']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Battle_FishArgs = {
  where: Battle_Fish_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Battle_LogArgs = {
  where: Battle_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Battle_Log_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Economy_LogArgs = {
  where: Economy_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Economy_Log_By_PkArgs = {
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
export type Mutation_RootDelete_Fish_With_ScoresArgs = {
  where: Fish_With_Scores_Bool_Exp;
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
export type Mutation_RootDelete_User_EconomyArgs = {
  where: User_Economy_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Economy_By_PkArgs = {
  user_id: Scalars['String']['input'];
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
export type Mutation_RootInsert_Battle_ConfigArgs = {
  objects: Array<Battle_Config_Insert_Input>;
  on_conflict?: InputMaybe<Battle_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Battle_Config_OneArgs = {
  object: Battle_Config_Insert_Input;
  on_conflict?: InputMaybe<Battle_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Battle_FishArgs = {
  objects: Array<Battle_Fish_Insert_Input>;
};


/** mutation root */
export type Mutation_RootInsert_Battle_Fish_OneArgs = {
  object: Battle_Fish_Insert_Input;
};


/** mutation root */
export type Mutation_RootInsert_Battle_LogArgs = {
  objects: Array<Battle_Log_Insert_Input>;
  on_conflict?: InputMaybe<Battle_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Battle_Log_OneArgs = {
  object: Battle_Log_Insert_Input;
  on_conflict?: InputMaybe<Battle_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Economy_LogArgs = {
  objects: Array<Economy_Log_Insert_Input>;
  on_conflict?: InputMaybe<Economy_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Economy_Log_OneArgs = {
  object: Economy_Log_Insert_Input;
  on_conflict?: InputMaybe<Economy_Log_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_FishArgs = {
  objects: Array<Fish_Insert_Input>;
  on_conflict?: InputMaybe<Fish_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_OneArgs = {
  object: Fish_Insert_Input;
  on_conflict?: InputMaybe<Fish_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_With_ScoresArgs = {
  objects: Array<Fish_With_Scores_Insert_Input>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_With_Scores_OneArgs = {
  object: Fish_With_Scores_Insert_Input;
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
export type Mutation_RootInsert_User_EconomyArgs = {
  objects: Array<User_Economy_Insert_Input>;
  on_conflict?: InputMaybe<User_Economy_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Economy_OneArgs = {
  object: User_Economy_Insert_Input;
  on_conflict?: InputMaybe<User_Economy_On_Conflict>;
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
export type Mutation_RootUpdate_Battle_ConfigArgs = {
  _inc?: InputMaybe<Battle_Config_Inc_Input>;
  _set?: InputMaybe<Battle_Config_Set_Input>;
  where: Battle_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Battle_Config_By_PkArgs = {
  _inc?: InputMaybe<Battle_Config_Inc_Input>;
  _set?: InputMaybe<Battle_Config_Set_Input>;
  pk_columns: Battle_Config_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Battle_Config_ManyArgs = {
  updates: Array<Battle_Config_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Battle_FishArgs = {
  _inc?: InputMaybe<Battle_Fish_Inc_Input>;
  _set?: InputMaybe<Battle_Fish_Set_Input>;
  where: Battle_Fish_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Battle_Fish_ManyArgs = {
  updates: Array<Battle_Fish_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Battle_LogArgs = {
  _inc?: InputMaybe<Battle_Log_Inc_Input>;
  _set?: InputMaybe<Battle_Log_Set_Input>;
  where: Battle_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Battle_Log_By_PkArgs = {
  _inc?: InputMaybe<Battle_Log_Inc_Input>;
  _set?: InputMaybe<Battle_Log_Set_Input>;
  pk_columns: Battle_Log_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Battle_Log_ManyArgs = {
  updates: Array<Battle_Log_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Economy_LogArgs = {
  _inc?: InputMaybe<Economy_Log_Inc_Input>;
  _set?: InputMaybe<Economy_Log_Set_Input>;
  where: Economy_Log_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Economy_Log_By_PkArgs = {
  _inc?: InputMaybe<Economy_Log_Inc_Input>;
  _set?: InputMaybe<Economy_Log_Set_Input>;
  pk_columns: Economy_Log_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Economy_Log_ManyArgs = {
  updates: Array<Economy_Log_Updates>;
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
export type Mutation_RootUpdate_Fish_ManyArgs = {
  updates: Array<Fish_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_With_ScoresArgs = {
  _inc?: InputMaybe<Fish_With_Scores_Inc_Input>;
  _set?: InputMaybe<Fish_With_Scores_Set_Input>;
  where: Fish_With_Scores_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_With_Scores_ManyArgs = {
  updates: Array<Fish_With_Scores_Updates>;
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
export type Mutation_RootUpdate_User_EconomyArgs = {
  _inc?: InputMaybe<User_Economy_Inc_Input>;
  _set?: InputMaybe<User_Economy_Set_Input>;
  where: User_Economy_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Economy_By_PkArgs = {
  _inc?: InputMaybe<User_Economy_Inc_Input>;
  _set?: InputMaybe<User_Economy_Set_Input>;
  pk_columns: User_Economy_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Economy_ManyArgs = {
  updates: Array<User_Economy_Updates>;
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

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "battle_config" */
  battle_config: Array<Battle_Config>;
  /** fetch aggregated fields from the table: "battle_config" */
  battle_config_aggregate: Battle_Config_Aggregate;
  /** fetch data from the table: "battle_config" using primary key columns */
  battle_config_by_pk?: Maybe<Battle_Config>;
  /** fetch data from the table: "battle_fish" */
  battle_fish: Array<Battle_Fish>;
  /** fetch aggregated fields from the table: "battle_fish" */
  battle_fish_aggregate: Battle_Fish_Aggregate;
  /** fetch data from the table: "battle_log" */
  battle_log: Array<Battle_Log>;
  /** fetch aggregated fields from the table: "battle_log" */
  battle_log_aggregate: Battle_Log_Aggregate;
  /** fetch data from the table: "battle_log" using primary key columns */
  battle_log_by_pk?: Maybe<Battle_Log>;
  /** fetch data from the table: "economy_log" */
  economy_log: Array<Economy_Log>;
  /** fetch aggregated fields from the table: "economy_log" */
  economy_log_aggregate: Economy_Log_Aggregate;
  /** fetch data from the table: "economy_log" using primary key columns */
  economy_log_by_pk?: Maybe<Economy_Log>;
  /** fetch data from the table: "fish" */
  fish: Array<Fish>;
  /** fetch aggregated fields from the table: "fish" */
  fish_aggregate: Fish_Aggregate;
  /** fetch data from the table: "fish" using primary key columns */
  fish_by_pk?: Maybe<Fish>;
  /** fetch data from the table: "fish_with_scores" */
  fish_with_scores: Array<Fish_With_Scores>;
  /** fetch aggregated fields from the table: "fish_with_scores" */
  fish_with_scores_aggregate: Fish_With_Scores_Aggregate;
  /** fetch data from the table: "reports" */
  reports: Array<Reports>;
  /** fetch aggregated fields from the table: "reports" */
  reports_aggregate: Reports_Aggregate;
  /** fetch data from the table: "reports" using primary key columns */
  reports_by_pk?: Maybe<Reports>;
  /** fetch data from the table: "user_economy" */
  user_economy: Array<User_Economy>;
  /** fetch aggregated fields from the table: "user_economy" */
  user_economy_aggregate: User_Economy_Aggregate;
  /** fetch data from the table: "user_economy" using primary key columns */
  user_economy_by_pk?: Maybe<User_Economy>;
  /** fetch data from the table: "user_fish_summary" */
  user_fish_summary: Array<User_Fish_Summary>;
  /** fetch aggregated fields from the table: "user_fish_summary" */
  user_fish_summary_aggregate: User_Fish_Summary_Aggregate;
  /** fetch data from the table: "votes" */
  votes: Array<Votes>;
  /** fetch aggregated fields from the table: "votes" */
  votes_aggregate: Votes_Aggregate;
  /** fetch data from the table: "votes" using primary key columns */
  votes_by_pk?: Maybe<Votes>;
};


export type Query_RootBattle_ConfigArgs = {
  distinct_on?: InputMaybe<Array<Battle_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Config_Order_By>>;
  where?: InputMaybe<Battle_Config_Bool_Exp>;
};


export type Query_RootBattle_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Battle_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Config_Order_By>>;
  where?: InputMaybe<Battle_Config_Bool_Exp>;
};


export type Query_RootBattle_Config_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Query_RootBattle_FishArgs = {
  distinct_on?: InputMaybe<Array<Battle_Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Fish_Order_By>>;
  where?: InputMaybe<Battle_Fish_Bool_Exp>;
};


export type Query_RootBattle_Fish_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Battle_Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Fish_Order_By>>;
  where?: InputMaybe<Battle_Fish_Bool_Exp>;
};


export type Query_RootBattle_LogArgs = {
  distinct_on?: InputMaybe<Array<Battle_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Log_Order_By>>;
  where?: InputMaybe<Battle_Log_Bool_Exp>;
};


export type Query_RootBattle_Log_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Battle_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Log_Order_By>>;
  where?: InputMaybe<Battle_Log_Bool_Exp>;
};


export type Query_RootBattle_Log_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEconomy_LogArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
};


export type Query_RootEconomy_Log_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
};


export type Query_RootEconomy_Log_By_PkArgs = {
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


export type Query_RootFish_With_ScoresArgs = {
  distinct_on?: InputMaybe<Array<Fish_With_Scores_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_With_Scores_Order_By>>;
  where?: InputMaybe<Fish_With_Scores_Bool_Exp>;
};


export type Query_RootFish_With_Scores_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_With_Scores_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_With_Scores_Order_By>>;
  where?: InputMaybe<Fish_With_Scores_Bool_Exp>;
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


export type Query_RootUser_EconomyArgs = {
  distinct_on?: InputMaybe<Array<User_Economy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Economy_Order_By>>;
  where?: InputMaybe<User_Economy_Bool_Exp>;
};


export type Query_RootUser_Economy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Economy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Economy_Order_By>>;
  where?: InputMaybe<User_Economy_Bool_Exp>;
};


export type Query_RootUser_Economy_By_PkArgs = {
  user_id: Scalars['String']['input'];
};


export type Query_RootUser_Fish_SummaryArgs = {
  distinct_on?: InputMaybe<Array<User_Fish_Summary_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Fish_Summary_Order_By>>;
  where?: InputMaybe<User_Fish_Summary_Bool_Exp>;
};


export type Query_RootUser_Fish_Summary_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Fish_Summary_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Fish_Summary_Order_By>>;
  where?: InputMaybe<User_Fish_Summary_Bool_Exp>;
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

/** columns and relationships of "reports" */
export type Reports = {
  __typename?: 'reports';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  moderator_action?: Maybe<Scalars['String']['output']>;
  moderator_id?: Maybe<Scalars['String']['output']>;
  reason: Scalars['String']['output'];
  reporter_ip?: Maybe<Scalars['String']['output']>;
  resolved_at?: Maybe<Scalars['timestamp']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "reports" */
export type Reports_Aggregate = {
  __typename?: 'reports_aggregate';
  aggregate?: Maybe<Reports_Aggregate_Fields>;
  nodes: Array<Reports>;
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

/** Boolean expression to filter rows from the table "reports". All fields are combined with a logical 'AND'. */
export type Reports_Bool_Exp = {
  _and?: InputMaybe<Array<Reports_Bool_Exp>>;
  _not?: InputMaybe<Reports_Bool_Exp>;
  _or?: InputMaybe<Array<Reports_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  moderator_action?: InputMaybe<String_Comparison_Exp>;
  moderator_id?: InputMaybe<String_Comparison_Exp>;
  reason?: InputMaybe<String_Comparison_Exp>;
  reporter_ip?: InputMaybe<String_Comparison_Exp>;
  resolved_at?: InputMaybe<Timestamp_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  url?: InputMaybe<String_Comparison_Exp>;
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
  /** fetch data from the table: "battle_config" */
  battle_config: Array<Battle_Config>;
  /** fetch aggregated fields from the table: "battle_config" */
  battle_config_aggregate: Battle_Config_Aggregate;
  /** fetch data from the table: "battle_config" using primary key columns */
  battle_config_by_pk?: Maybe<Battle_Config>;
  /** fetch data from the table in a streaming manner: "battle_config" */
  battle_config_stream: Array<Battle_Config>;
  /** fetch data from the table: "battle_fish" */
  battle_fish: Array<Battle_Fish>;
  /** fetch aggregated fields from the table: "battle_fish" */
  battle_fish_aggregate: Battle_Fish_Aggregate;
  /** fetch data from the table in a streaming manner: "battle_fish" */
  battle_fish_stream: Array<Battle_Fish>;
  /** fetch data from the table: "battle_log" */
  battle_log: Array<Battle_Log>;
  /** fetch aggregated fields from the table: "battle_log" */
  battle_log_aggregate: Battle_Log_Aggregate;
  /** fetch data from the table: "battle_log" using primary key columns */
  battle_log_by_pk?: Maybe<Battle_Log>;
  /** fetch data from the table in a streaming manner: "battle_log" */
  battle_log_stream: Array<Battle_Log>;
  /** fetch data from the table: "economy_log" */
  economy_log: Array<Economy_Log>;
  /** fetch aggregated fields from the table: "economy_log" */
  economy_log_aggregate: Economy_Log_Aggregate;
  /** fetch data from the table: "economy_log" using primary key columns */
  economy_log_by_pk?: Maybe<Economy_Log>;
  /** fetch data from the table in a streaming manner: "economy_log" */
  economy_log_stream: Array<Economy_Log>;
  /** fetch data from the table: "fish" */
  fish: Array<Fish>;
  /** fetch aggregated fields from the table: "fish" */
  fish_aggregate: Fish_Aggregate;
  /** fetch data from the table: "fish" using primary key columns */
  fish_by_pk?: Maybe<Fish>;
  /** fetch data from the table in a streaming manner: "fish" */
  fish_stream: Array<Fish>;
  /** fetch data from the table: "fish_with_scores" */
  fish_with_scores: Array<Fish_With_Scores>;
  /** fetch aggregated fields from the table: "fish_with_scores" */
  fish_with_scores_aggregate: Fish_With_Scores_Aggregate;
  /** fetch data from the table in a streaming manner: "fish_with_scores" */
  fish_with_scores_stream: Array<Fish_With_Scores>;
  /** fetch data from the table: "reports" */
  reports: Array<Reports>;
  /** fetch aggregated fields from the table: "reports" */
  reports_aggregate: Reports_Aggregate;
  /** fetch data from the table: "reports" using primary key columns */
  reports_by_pk?: Maybe<Reports>;
  /** fetch data from the table in a streaming manner: "reports" */
  reports_stream: Array<Reports>;
  /** fetch data from the table: "user_economy" */
  user_economy: Array<User_Economy>;
  /** fetch aggregated fields from the table: "user_economy" */
  user_economy_aggregate: User_Economy_Aggregate;
  /** fetch data from the table: "user_economy" using primary key columns */
  user_economy_by_pk?: Maybe<User_Economy>;
  /** fetch data from the table in a streaming manner: "user_economy" */
  user_economy_stream: Array<User_Economy>;
  /** fetch data from the table: "user_fish_summary" */
  user_fish_summary: Array<User_Fish_Summary>;
  /** fetch aggregated fields from the table: "user_fish_summary" */
  user_fish_summary_aggregate: User_Fish_Summary_Aggregate;
  /** fetch data from the table in a streaming manner: "user_fish_summary" */
  user_fish_summary_stream: Array<User_Fish_Summary>;
  /** fetch data from the table: "votes" */
  votes: Array<Votes>;
  /** fetch aggregated fields from the table: "votes" */
  votes_aggregate: Votes_Aggregate;
  /** fetch data from the table: "votes" using primary key columns */
  votes_by_pk?: Maybe<Votes>;
  /** fetch data from the table in a streaming manner: "votes" */
  votes_stream: Array<Votes>;
};


export type Subscription_RootBattle_ConfigArgs = {
  distinct_on?: InputMaybe<Array<Battle_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Config_Order_By>>;
  where?: InputMaybe<Battle_Config_Bool_Exp>;
};


export type Subscription_RootBattle_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Battle_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Config_Order_By>>;
  where?: InputMaybe<Battle_Config_Bool_Exp>;
};


export type Subscription_RootBattle_Config_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Subscription_RootBattle_Config_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Battle_Config_Stream_Cursor_Input>>;
  where?: InputMaybe<Battle_Config_Bool_Exp>;
};


export type Subscription_RootBattle_FishArgs = {
  distinct_on?: InputMaybe<Array<Battle_Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Fish_Order_By>>;
  where?: InputMaybe<Battle_Fish_Bool_Exp>;
};


export type Subscription_RootBattle_Fish_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Battle_Fish_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Fish_Order_By>>;
  where?: InputMaybe<Battle_Fish_Bool_Exp>;
};


export type Subscription_RootBattle_Fish_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Battle_Fish_Stream_Cursor_Input>>;
  where?: InputMaybe<Battle_Fish_Bool_Exp>;
};


export type Subscription_RootBattle_LogArgs = {
  distinct_on?: InputMaybe<Array<Battle_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Log_Order_By>>;
  where?: InputMaybe<Battle_Log_Bool_Exp>;
};


export type Subscription_RootBattle_Log_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Battle_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Battle_Log_Order_By>>;
  where?: InputMaybe<Battle_Log_Bool_Exp>;
};


export type Subscription_RootBattle_Log_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootBattle_Log_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Battle_Log_Stream_Cursor_Input>>;
  where?: InputMaybe<Battle_Log_Bool_Exp>;
};


export type Subscription_RootEconomy_LogArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
};


export type Subscription_RootEconomy_Log_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
};


export type Subscription_RootEconomy_Log_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEconomy_Log_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Economy_Log_Stream_Cursor_Input>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
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


export type Subscription_RootFish_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Fish_Stream_Cursor_Input>>;
  where?: InputMaybe<Fish_Bool_Exp>;
};


export type Subscription_RootFish_With_ScoresArgs = {
  distinct_on?: InputMaybe<Array<Fish_With_Scores_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_With_Scores_Order_By>>;
  where?: InputMaybe<Fish_With_Scores_Bool_Exp>;
};


export type Subscription_RootFish_With_Scores_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_With_Scores_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_With_Scores_Order_By>>;
  where?: InputMaybe<Fish_With_Scores_Bool_Exp>;
};


export type Subscription_RootFish_With_Scores_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Fish_With_Scores_Stream_Cursor_Input>>;
  where?: InputMaybe<Fish_With_Scores_Bool_Exp>;
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


export type Subscription_RootUser_EconomyArgs = {
  distinct_on?: InputMaybe<Array<User_Economy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Economy_Order_By>>;
  where?: InputMaybe<User_Economy_Bool_Exp>;
};


export type Subscription_RootUser_Economy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Economy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Economy_Order_By>>;
  where?: InputMaybe<User_Economy_Bool_Exp>;
};


export type Subscription_RootUser_Economy_By_PkArgs = {
  user_id: Scalars['String']['input'];
};


export type Subscription_RootUser_Economy_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Economy_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Economy_Bool_Exp>;
};


export type Subscription_RootUser_Fish_SummaryArgs = {
  distinct_on?: InputMaybe<Array<User_Fish_Summary_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Fish_Summary_Order_By>>;
  where?: InputMaybe<User_Fish_Summary_Bool_Exp>;
};


export type Subscription_RootUser_Fish_Summary_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Fish_Summary_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Fish_Summary_Order_By>>;
  where?: InputMaybe<User_Fish_Summary_Bool_Exp>;
};


export type Subscription_RootUser_Fish_Summary_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Fish_Summary_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Fish_Summary_Bool_Exp>;
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

/** columns and relationships of "user_economy" */
export type User_Economy = {
  __typename?: 'user_economy';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_food: Scalars['Int']['output'];
  last_daily_bonus?: Maybe<Scalars['timestamp']['output']>;
  total_earned?: Maybe<Scalars['Int']['output']>;
  total_spent?: Maybe<Scalars['Int']['output']>;
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "user_economy" */
export type User_Economy_Aggregate = {
  __typename?: 'user_economy_aggregate';
  aggregate?: Maybe<User_Economy_Aggregate_Fields>;
  nodes: Array<User_Economy>;
};

/** aggregate fields of "user_economy" */
export type User_Economy_Aggregate_Fields = {
  __typename?: 'user_economy_aggregate_fields';
  avg?: Maybe<User_Economy_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Economy_Max_Fields>;
  min?: Maybe<User_Economy_Min_Fields>;
  stddev?: Maybe<User_Economy_Stddev_Fields>;
  stddev_pop?: Maybe<User_Economy_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Economy_Stddev_Samp_Fields>;
  sum?: Maybe<User_Economy_Sum_Fields>;
  var_pop?: Maybe<User_Economy_Var_Pop_Fields>;
  var_samp?: Maybe<User_Economy_Var_Samp_Fields>;
  variance?: Maybe<User_Economy_Variance_Fields>;
};


/** aggregate fields of "user_economy" */
export type User_Economy_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Economy_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type User_Economy_Avg_Fields = {
  __typename?: 'user_economy_avg_fields';
  fish_food?: Maybe<Scalars['Float']['output']>;
  total_earned?: Maybe<Scalars['Float']['output']>;
  total_spent?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "user_economy". All fields are combined with a logical 'AND'. */
export type User_Economy_Bool_Exp = {
  _and?: InputMaybe<Array<User_Economy_Bool_Exp>>;
  _not?: InputMaybe<User_Economy_Bool_Exp>;
  _or?: InputMaybe<Array<User_Economy_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_food?: InputMaybe<Int_Comparison_Exp>;
  last_daily_bonus?: InputMaybe<Timestamp_Comparison_Exp>;
  total_earned?: InputMaybe<Int_Comparison_Exp>;
  total_spent?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_economy" */
export enum User_Economy_Constraint {
  /** unique or primary key constraint on columns "user_id" */
  UserEconomyPkey = 'user_economy_pkey'
}

/** input type for incrementing numeric columns in table "user_economy" */
export type User_Economy_Inc_Input = {
  fish_food?: InputMaybe<Scalars['Int']['input']>;
  total_earned?: InputMaybe<Scalars['Int']['input']>;
  total_spent?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_economy" */
export type User_Economy_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_food?: InputMaybe<Scalars['Int']['input']>;
  last_daily_bonus?: InputMaybe<Scalars['timestamp']['input']>;
  total_earned?: InputMaybe<Scalars['Int']['input']>;
  total_spent?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type User_Economy_Max_Fields = {
  __typename?: 'user_economy_max_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_food?: Maybe<Scalars['Int']['output']>;
  last_daily_bonus?: Maybe<Scalars['timestamp']['output']>;
  total_earned?: Maybe<Scalars['Int']['output']>;
  total_spent?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type User_Economy_Min_Fields = {
  __typename?: 'user_economy_min_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_food?: Maybe<Scalars['Int']['output']>;
  last_daily_bonus?: Maybe<Scalars['timestamp']['output']>;
  total_earned?: Maybe<Scalars['Int']['output']>;
  total_spent?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "user_economy" */
export type User_Economy_Mutation_Response = {
  __typename?: 'user_economy_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Economy>;
};

/** on_conflict condition type for table "user_economy" */
export type User_Economy_On_Conflict = {
  constraint: User_Economy_Constraint;
  update_columns?: Array<User_Economy_Update_Column>;
  where?: InputMaybe<User_Economy_Bool_Exp>;
};

/** Ordering options when selecting data from "user_economy". */
export type User_Economy_Order_By = {
  created_at?: InputMaybe<Order_By>;
  fish_food?: InputMaybe<Order_By>;
  last_daily_bonus?: InputMaybe<Order_By>;
  total_earned?: InputMaybe<Order_By>;
  total_spent?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_economy */
export type User_Economy_Pk_Columns_Input = {
  user_id: Scalars['String']['input'];
};

/** select columns of table "user_economy" */
export enum User_Economy_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishFood = 'fish_food',
  /** column name */
  LastDailyBonus = 'last_daily_bonus',
  /** column name */
  TotalEarned = 'total_earned',
  /** column name */
  TotalSpent = 'total_spent',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "user_economy" */
export type User_Economy_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_food?: InputMaybe<Scalars['Int']['input']>;
  last_daily_bonus?: InputMaybe<Scalars['timestamp']['input']>;
  total_earned?: InputMaybe<Scalars['Int']['input']>;
  total_spent?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type User_Economy_Stddev_Fields = {
  __typename?: 'user_economy_stddev_fields';
  fish_food?: Maybe<Scalars['Float']['output']>;
  total_earned?: Maybe<Scalars['Float']['output']>;
  total_spent?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type User_Economy_Stddev_Pop_Fields = {
  __typename?: 'user_economy_stddev_pop_fields';
  fish_food?: Maybe<Scalars['Float']['output']>;
  total_earned?: Maybe<Scalars['Float']['output']>;
  total_spent?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type User_Economy_Stddev_Samp_Fields = {
  __typename?: 'user_economy_stddev_samp_fields';
  fish_food?: Maybe<Scalars['Float']['output']>;
  total_earned?: Maybe<Scalars['Float']['output']>;
  total_spent?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "user_economy" */
export type User_Economy_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Economy_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Economy_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_food?: InputMaybe<Scalars['Int']['input']>;
  last_daily_bonus?: InputMaybe<Scalars['timestamp']['input']>;
  total_earned?: InputMaybe<Scalars['Int']['input']>;
  total_spent?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type User_Economy_Sum_Fields = {
  __typename?: 'user_economy_sum_fields';
  fish_food?: Maybe<Scalars['Int']['output']>;
  total_earned?: Maybe<Scalars['Int']['output']>;
  total_spent?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "user_economy" */
export enum User_Economy_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  FishFood = 'fish_food',
  /** column name */
  LastDailyBonus = 'last_daily_bonus',
  /** column name */
  TotalEarned = 'total_earned',
  /** column name */
  TotalSpent = 'total_spent',
  /** column name */
  UserId = 'user_id'
}

export type User_Economy_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Economy_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Economy_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Economy_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Economy_Var_Pop_Fields = {
  __typename?: 'user_economy_var_pop_fields';
  fish_food?: Maybe<Scalars['Float']['output']>;
  total_earned?: Maybe<Scalars['Float']['output']>;
  total_spent?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type User_Economy_Var_Samp_Fields = {
  __typename?: 'user_economy_var_samp_fields';
  fish_food?: Maybe<Scalars['Float']['output']>;
  total_earned?: Maybe<Scalars['Float']['output']>;
  total_spent?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type User_Economy_Variance_Fields = {
  __typename?: 'user_economy_variance_fields';
  fish_food?: Maybe<Scalars['Float']['output']>;
  total_earned?: Maybe<Scalars['Float']['output']>;
  total_spent?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "user_fish_summary" */
export type User_Fish_Summary = {
  __typename?: 'user_fish_summary';
  alive_fish?: Maybe<Scalars['bigint']['output']>;
  avg_level?: Maybe<Scalars['numeric']['output']>;
  max_level?: Maybe<Scalars['Int']['output']>;
  total_fish?: Maybe<Scalars['bigint']['output']>;
  total_losses?: Maybe<Scalars['bigint']['output']>;
  total_upvotes?: Maybe<Scalars['bigint']['output']>;
  total_wins?: Maybe<Scalars['bigint']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregated selection of "user_fish_summary" */
export type User_Fish_Summary_Aggregate = {
  __typename?: 'user_fish_summary_aggregate';
  aggregate?: Maybe<User_Fish_Summary_Aggregate_Fields>;
  nodes: Array<User_Fish_Summary>;
};

/** aggregate fields of "user_fish_summary" */
export type User_Fish_Summary_Aggregate_Fields = {
  __typename?: 'user_fish_summary_aggregate_fields';
  avg?: Maybe<User_Fish_Summary_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Fish_Summary_Max_Fields>;
  min?: Maybe<User_Fish_Summary_Min_Fields>;
  stddev?: Maybe<User_Fish_Summary_Stddev_Fields>;
  stddev_pop?: Maybe<User_Fish_Summary_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Fish_Summary_Stddev_Samp_Fields>;
  sum?: Maybe<User_Fish_Summary_Sum_Fields>;
  var_pop?: Maybe<User_Fish_Summary_Var_Pop_Fields>;
  var_samp?: Maybe<User_Fish_Summary_Var_Samp_Fields>;
  variance?: Maybe<User_Fish_Summary_Variance_Fields>;
};


/** aggregate fields of "user_fish_summary" */
export type User_Fish_Summary_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Fish_Summary_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type User_Fish_Summary_Avg_Fields = {
  __typename?: 'user_fish_summary_avg_fields';
  alive_fish?: Maybe<Scalars['Float']['output']>;
  avg_level?: Maybe<Scalars['Float']['output']>;
  max_level?: Maybe<Scalars['Float']['output']>;
  total_fish?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_upvotes?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "user_fish_summary". All fields are combined with a logical 'AND'. */
export type User_Fish_Summary_Bool_Exp = {
  _and?: InputMaybe<Array<User_Fish_Summary_Bool_Exp>>;
  _not?: InputMaybe<User_Fish_Summary_Bool_Exp>;
  _or?: InputMaybe<Array<User_Fish_Summary_Bool_Exp>>;
  alive_fish?: InputMaybe<Bigint_Comparison_Exp>;
  avg_level?: InputMaybe<Numeric_Comparison_Exp>;
  max_level?: InputMaybe<Int_Comparison_Exp>;
  total_fish?: InputMaybe<Bigint_Comparison_Exp>;
  total_losses?: InputMaybe<Bigint_Comparison_Exp>;
  total_upvotes?: InputMaybe<Bigint_Comparison_Exp>;
  total_wins?: InputMaybe<Bigint_Comparison_Exp>;
  user_id?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type User_Fish_Summary_Max_Fields = {
  __typename?: 'user_fish_summary_max_fields';
  alive_fish?: Maybe<Scalars['bigint']['output']>;
  avg_level?: Maybe<Scalars['numeric']['output']>;
  max_level?: Maybe<Scalars['Int']['output']>;
  total_fish?: Maybe<Scalars['bigint']['output']>;
  total_losses?: Maybe<Scalars['bigint']['output']>;
  total_upvotes?: Maybe<Scalars['bigint']['output']>;
  total_wins?: Maybe<Scalars['bigint']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type User_Fish_Summary_Min_Fields = {
  __typename?: 'user_fish_summary_min_fields';
  alive_fish?: Maybe<Scalars['bigint']['output']>;
  avg_level?: Maybe<Scalars['numeric']['output']>;
  max_level?: Maybe<Scalars['Int']['output']>;
  total_fish?: Maybe<Scalars['bigint']['output']>;
  total_losses?: Maybe<Scalars['bigint']['output']>;
  total_upvotes?: Maybe<Scalars['bigint']['output']>;
  total_wins?: Maybe<Scalars['bigint']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** Ordering options when selecting data from "user_fish_summary". */
export type User_Fish_Summary_Order_By = {
  alive_fish?: InputMaybe<Order_By>;
  avg_level?: InputMaybe<Order_By>;
  max_level?: InputMaybe<Order_By>;
  total_fish?: InputMaybe<Order_By>;
  total_losses?: InputMaybe<Order_By>;
  total_upvotes?: InputMaybe<Order_By>;
  total_wins?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "user_fish_summary" */
export enum User_Fish_Summary_Select_Column {
  /** column name */
  AliveFish = 'alive_fish',
  /** column name */
  AvgLevel = 'avg_level',
  /** column name */
  MaxLevel = 'max_level',
  /** column name */
  TotalFish = 'total_fish',
  /** column name */
  TotalLosses = 'total_losses',
  /** column name */
  TotalUpvotes = 'total_upvotes',
  /** column name */
  TotalWins = 'total_wins',
  /** column name */
  UserId = 'user_id'
}

/** aggregate stddev on columns */
export type User_Fish_Summary_Stddev_Fields = {
  __typename?: 'user_fish_summary_stddev_fields';
  alive_fish?: Maybe<Scalars['Float']['output']>;
  avg_level?: Maybe<Scalars['Float']['output']>;
  max_level?: Maybe<Scalars['Float']['output']>;
  total_fish?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_upvotes?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type User_Fish_Summary_Stddev_Pop_Fields = {
  __typename?: 'user_fish_summary_stddev_pop_fields';
  alive_fish?: Maybe<Scalars['Float']['output']>;
  avg_level?: Maybe<Scalars['Float']['output']>;
  max_level?: Maybe<Scalars['Float']['output']>;
  total_fish?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_upvotes?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type User_Fish_Summary_Stddev_Samp_Fields = {
  __typename?: 'user_fish_summary_stddev_samp_fields';
  alive_fish?: Maybe<Scalars['Float']['output']>;
  avg_level?: Maybe<Scalars['Float']['output']>;
  max_level?: Maybe<Scalars['Float']['output']>;
  total_fish?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_upvotes?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "user_fish_summary" */
export type User_Fish_Summary_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Fish_Summary_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Fish_Summary_Stream_Cursor_Value_Input = {
  alive_fish?: InputMaybe<Scalars['bigint']['input']>;
  avg_level?: InputMaybe<Scalars['numeric']['input']>;
  max_level?: InputMaybe<Scalars['Int']['input']>;
  total_fish?: InputMaybe<Scalars['bigint']['input']>;
  total_losses?: InputMaybe<Scalars['bigint']['input']>;
  total_upvotes?: InputMaybe<Scalars['bigint']['input']>;
  total_wins?: InputMaybe<Scalars['bigint']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type User_Fish_Summary_Sum_Fields = {
  __typename?: 'user_fish_summary_sum_fields';
  alive_fish?: Maybe<Scalars['bigint']['output']>;
  avg_level?: Maybe<Scalars['numeric']['output']>;
  max_level?: Maybe<Scalars['Int']['output']>;
  total_fish?: Maybe<Scalars['bigint']['output']>;
  total_losses?: Maybe<Scalars['bigint']['output']>;
  total_upvotes?: Maybe<Scalars['bigint']['output']>;
  total_wins?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate var_pop on columns */
export type User_Fish_Summary_Var_Pop_Fields = {
  __typename?: 'user_fish_summary_var_pop_fields';
  alive_fish?: Maybe<Scalars['Float']['output']>;
  avg_level?: Maybe<Scalars['Float']['output']>;
  max_level?: Maybe<Scalars['Float']['output']>;
  total_fish?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_upvotes?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type User_Fish_Summary_Var_Samp_Fields = {
  __typename?: 'user_fish_summary_var_samp_fields';
  alive_fish?: Maybe<Scalars['Float']['output']>;
  avg_level?: Maybe<Scalars['Float']['output']>;
  max_level?: Maybe<Scalars['Float']['output']>;
  total_fish?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_upvotes?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type User_Fish_Summary_Variance_Fields = {
  __typename?: 'user_fish_summary_variance_fields';
  alive_fish?: Maybe<Scalars['Float']['output']>;
  avg_level?: Maybe<Scalars['Float']['output']>;
  max_level?: Maybe<Scalars['Float']['output']>;
  total_fish?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_upvotes?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
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
  fish_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  user_id: Scalars['String']['output'];
  vote_type: Scalars['String']['output'];
};

/** aggregated selection of "votes" */
export type Votes_Aggregate = {
  __typename?: 'votes_aggregate';
  aggregate?: Maybe<Votes_Aggregate_Fields>;
  nodes: Array<Votes>;
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

/** Boolean expression to filter rows from the table "votes". All fields are combined with a logical 'AND'. */
export type Votes_Bool_Exp = {
  _and?: InputMaybe<Array<Votes_Bool_Exp>>;
  _not?: InputMaybe<Votes_Bool_Exp>;
  _or?: InputMaybe<Array<Votes_Bool_Exp>>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
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
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
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

/** aggregate min on columns */
export type Votes_Min_Fields = {
  __typename?: 'votes_min_fields';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
  vote_type?: Maybe<Scalars['String']['output']>;
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
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
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
