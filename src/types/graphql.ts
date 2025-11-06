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
  /** An object relationship */
  fish?: Maybe<Fish>;
  fish_id?: Maybe<Scalars['uuid']['output']>;
  id: Scalars['uuid']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "economy_log" */
export type Economy_Log_Aggregate = {
  __typename?: 'economy_log_aggregate';
  aggregate?: Maybe<Economy_Log_Aggregate_Fields>;
  nodes: Array<Economy_Log>;
};

export type Economy_Log_Aggregate_Bool_Exp = {
  count?: InputMaybe<Economy_Log_Aggregate_Bool_Exp_Count>;
};

export type Economy_Log_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Economy_Log_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Economy_Log_Bool_Exp>;
  predicate: Int_Comparison_Exp;
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

/** order by aggregate values of table "economy_log" */
export type Economy_Log_Aggregate_Order_By = {
  avg?: InputMaybe<Economy_Log_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Economy_Log_Max_Order_By>;
  min?: InputMaybe<Economy_Log_Min_Order_By>;
  stddev?: InputMaybe<Economy_Log_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Economy_Log_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Economy_Log_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Economy_Log_Sum_Order_By>;
  var_pop?: InputMaybe<Economy_Log_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Economy_Log_Var_Samp_Order_By>;
  variance?: InputMaybe<Economy_Log_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "economy_log" */
export type Economy_Log_Arr_Rel_Insert_Input = {
  data: Array<Economy_Log_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Economy_Log_On_Conflict>;
};

/** aggregate avg on columns */
export type Economy_Log_Avg_Fields = {
  __typename?: 'economy_log_avg_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "economy_log" */
export type Economy_Log_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
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
  fish?: InputMaybe<Fish_Bool_Exp>;
  fish_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
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
  fish?: InputMaybe<Fish_Obj_Rel_Insert_Input>;
  fish_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
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

/** order by max() on columns of table "economy_log" */
export type Economy_Log_Max_Order_By = {
  action?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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

/** order by min() on columns of table "economy_log" */
export type Economy_Log_Min_Order_By = {
  action?: InputMaybe<Order_By>;
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  fish?: InputMaybe<Fish_Order_By>;
  fish_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
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

/** order by stddev() on columns of table "economy_log" */
export type Economy_Log_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Economy_Log_Stddev_Pop_Fields = {
  __typename?: 'economy_log_stddev_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "economy_log" */
export type Economy_Log_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Economy_Log_Stddev_Samp_Fields = {
  __typename?: 'economy_log_stddev_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "economy_log" */
export type Economy_Log_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
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

/** order by sum() on columns of table "economy_log" */
export type Economy_Log_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
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

/** order by var_pop() on columns of table "economy_log" */
export type Economy_Log_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Economy_Log_Var_Samp_Fields = {
  __typename?: 'economy_log_var_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "economy_log" */
export type Economy_Log_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Economy_Log_Variance_Fields = {
  __typename?: 'economy_log_variance_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  balance_after?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "economy_log" */
export type Economy_Log_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  balance_after?: InputMaybe<Order_By>;
};

/** columns and relationships of "fish" */
export type Fish = {
  __typename?: 'fish';
  artist?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  /** An array relationship */
  economy_logs: Array<Economy_Log>;
  /** An aggregate relationship */
  economy_logs_aggregate: Economy_Log_Aggregate;
  fish_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  image_url: Scalars['String']['output'];
  is_approved?: Maybe<Scalars['Boolean']['output']>;
  personality_type?: Maybe<Scalars['String']['output']>;
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
export type FishEconomy_LogsArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
};


/** columns and relationships of "fish" */
export type FishEconomy_Logs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
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
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "fish" */
export type Fish_Avg_Order_By = {
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "fish". All fields are combined with a logical 'AND'. */
export type Fish_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_Bool_Exp>>;
  _not?: InputMaybe<Fish_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_Bool_Exp>>;
  artist?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  economy_logs?: InputMaybe<Economy_Log_Bool_Exp>;
  economy_logs_aggregate?: InputMaybe<Economy_Log_Aggregate_Bool_Exp>;
  fish_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image_url?: InputMaybe<String_Comparison_Exp>;
  is_approved?: InputMaybe<Boolean_Comparison_Exp>;
  personality_type?: InputMaybe<String_Comparison_Exp>;
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

/** input type for incrementing numeric columns in table "fish" */
export type Fish_Inc_Input = {
  report_count?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "fish" */
export type Fish_Insert_Input = {
  artist?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  economy_logs?: InputMaybe<Economy_Log_Arr_Rel_Insert_Input>;
  fish_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  personality_type?: InputMaybe<Scalars['String']['input']>;
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
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  personality_type?: Maybe<Scalars['String']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "fish" */
export type Fish_Max_Order_By = {
  artist?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  personality_type?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Fish_Min_Fields = {
  __typename?: 'fish_min_fields';
  artist?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image_url?: Maybe<Scalars['String']['output']>;
  personality_type?: Maybe<Scalars['String']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "fish" */
export type Fish_Min_Order_By = {
  artist?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  fish_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  personality_type?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  created_at?: InputMaybe<Order_By>;
  economy_logs_aggregate?: InputMaybe<Economy_Log_Aggregate_Order_By>;
  fish_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image_url?: InputMaybe<Order_By>;
  is_approved?: InputMaybe<Order_By>;
  personality_type?: InputMaybe<Order_By>;
  report_count?: InputMaybe<Order_By>;
  reported?: InputMaybe<Order_By>;
  reports_aggregate?: InputMaybe<Reports_Aggregate_Order_By>;
  upvotes?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  votes_aggregate?: InputMaybe<Votes_Aggregate_Order_By>;
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
  PersonalityType = 'personality_type',
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
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  personality_type?: InputMaybe<Scalars['String']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Fish_Stddev_Fields = {
  __typename?: 'fish_stddev_fields';
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "fish" */
export type Fish_Stddev_Order_By = {
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Fish_Stddev_Pop_Fields = {
  __typename?: 'fish_stddev_pop_fields';
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "fish" */
export type Fish_Stddev_Pop_Order_By = {
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Fish_Stddev_Samp_Fields = {
  __typename?: 'fish_stddev_samp_fields';
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "fish" */
export type Fish_Stddev_Samp_Order_By = {
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
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  fish_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_approved?: InputMaybe<Scalars['Boolean']['input']>;
  personality_type?: InputMaybe<Scalars['String']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  reported?: InputMaybe<Scalars['Boolean']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Fish_Sum_Fields = {
  __typename?: 'fish_sum_fields';
  report_count?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "fish" */
export type Fish_Sum_Order_By = {
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** 测试鱼数据表，用于存储从原作者后端下载的鱼数据 */
export type Fish_Test = {
  __typename?: 'fish_test';
  /** 作者名称 */
  artist?: Maybe<Scalars['String']['output']>;
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes: Scalars['Int']['output'];
  experience: Scalars['Int']['output'];
  health: Scalars['Int']['output'];
  /** 鱼的唯一标识符 (UUID) */
  id: Scalars['uuid']['output'];
  /** 鱼的图片URL（七牛云存储） */
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
  /** 天赋值，影响战斗力 */
  talent: Scalars['Int']['output'];
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes: Scalars['Int']['output'];
  /** 创建该鱼的用户ID */
  user_id: Scalars['String']['output'];
};

/** aggregated selection of "fish_test" */
export type Fish_Test_Aggregate = {
  __typename?: 'fish_test_aggregate';
  aggregate?: Maybe<Fish_Test_Aggregate_Fields>;
  nodes: Array<Fish_Test>;
};

/** aggregate fields of "fish_test" */
export type Fish_Test_Aggregate_Fields = {
  __typename?: 'fish_test_aggregate_fields';
  avg?: Maybe<Fish_Test_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Fish_Test_Max_Fields>;
  min?: Maybe<Fish_Test_Min_Fields>;
  stddev?: Maybe<Fish_Test_Stddev_Fields>;
  stddev_pop?: Maybe<Fish_Test_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Fish_Test_Stddev_Samp_Fields>;
  sum?: Maybe<Fish_Test_Sum_Fields>;
  var_pop?: Maybe<Fish_Test_Var_Pop_Fields>;
  var_samp?: Maybe<Fish_Test_Var_Samp_Fields>;
  variance?: Maybe<Fish_Test_Variance_Fields>;
};


/** aggregate fields of "fish_test" */
export type Fish_Test_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Fish_Test_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Fish_Test_Avg_Fields = {
  __typename?: 'fish_test_avg_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "fish_test". All fields are combined with a logical 'AND'. */
export type Fish_Test_Bool_Exp = {
  _and?: InputMaybe<Array<Fish_Test_Bool_Exp>>;
  _not?: InputMaybe<Fish_Test_Bool_Exp>;
  _or?: InputMaybe<Array<Fish_Test_Bool_Exp>>;
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

/** unique or primary key constraints on table "fish_test" */
export enum Fish_Test_Constraint {
  /** unique or primary key constraint on columns "id" */
  FishTestPkey = 'fish_test_pkey'
}

/** input type for incrementing numeric columns in table "fish_test" */
export type Fish_Test_Inc_Input = {
  /** 计算后的战斗力 */
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  max_health?: InputMaybe<Scalars['Int']['input']>;
  position_row?: InputMaybe<Scalars['Int']['input']>;
  report_count?: InputMaybe<Scalars['Int']['input']>;
  /** 天赋值，影响战斗力 */
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "fish_test" */
export type Fish_Test_Insert_Input = {
  /** 作者名称 */
  artist?: InputMaybe<Scalars['String']['input']>;
  /** 计算后的战斗力 */
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  /** 鱼的唯一标识符 (UUID) */
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 鱼的图片URL（七牛云存储） */
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
  /** 天赋值，影响战斗力 */
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  /** 创建该鱼的用户ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Fish_Test_Max_Fields = {
  __typename?: 'fish_test_max_fields';
  /** 作者名称 */
  artist?: Maybe<Scalars['String']['output']>;
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  /** 鱼的唯一标识符 (UUID) */
  id?: Maybe<Scalars['uuid']['output']>;
  /** 鱼的图片URL（七牛云存储） */
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  /** 创建该鱼的用户ID */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Fish_Test_Min_Fields = {
  __typename?: 'fish_test_min_fields';
  /** 作者名称 */
  artist?: Maybe<Scalars['String']['output']>;
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['numeric']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  /** 鱼的唯一标识符 (UUID) */
  id?: Maybe<Scalars['uuid']['output']>;
  /** 鱼的图片URL（七牛云存储） */
  image_url?: Maybe<Scalars['String']['output']>;
  last_exp_update?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  moderator_notes?: Maybe<Scalars['String']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
  /** 创建该鱼的用户ID */
  user_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "fish_test" */
export type Fish_Test_Mutation_Response = {
  __typename?: 'fish_test_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Fish_Test>;
};

/** on_conflict condition type for table "fish_test" */
export type Fish_Test_On_Conflict = {
  constraint: Fish_Test_Constraint;
  update_columns?: Array<Fish_Test_Update_Column>;
  where?: InputMaybe<Fish_Test_Bool_Exp>;
};

/** Ordering options when selecting data from "fish_test". */
export type Fish_Test_Order_By = {
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

/** primary key columns input for table: fish_test */
export type Fish_Test_Pk_Columns_Input = {
  /** 鱼的唯一标识符 (UUID) */
  id: Scalars['uuid']['input'];
};

/** select columns of table "fish_test" */
export enum Fish_Test_Select_Column {
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

/** input type for updating data in table "fish_test" */
export type Fish_Test_Set_Input = {
  /** 作者名称 */
  artist?: InputMaybe<Scalars['String']['input']>;
  /** 计算后的战斗力 */
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  /** 鱼的唯一标识符 (UUID) */
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 鱼的图片URL（七牛云存储） */
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
  /** 天赋值，影响战斗力 */
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  /** 创建该鱼的用户ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Fish_Test_Stddev_Fields = {
  __typename?: 'fish_test_stddev_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Fish_Test_Stddev_Pop_Fields = {
  __typename?: 'fish_test_stddev_pop_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Fish_Test_Stddev_Samp_Fields = {
  __typename?: 'fish_test_stddev_samp_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "fish_test" */
export type Fish_Test_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Fish_Test_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Fish_Test_Stream_Cursor_Value_Input = {
  /** 作者名称 */
  artist?: InputMaybe<Scalars['String']['input']>;
  /** 计算后的战斗力 */
  battle_power?: InputMaybe<Scalars['numeric']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  downvotes?: InputMaybe<Scalars['Int']['input']>;
  experience?: InputMaybe<Scalars['Int']['input']>;
  health?: InputMaybe<Scalars['Int']['input']>;
  /** 鱼的唯一标识符 (UUID) */
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** 鱼的图片URL（七牛云存储） */
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
  /** 天赋值，影响战斗力 */
  talent?: InputMaybe<Scalars['Int']['input']>;
  total_losses?: InputMaybe<Scalars['Int']['input']>;
  total_wins?: InputMaybe<Scalars['Int']['input']>;
  upvotes?: InputMaybe<Scalars['Int']['input']>;
  /** 创建该鱼的用户ID */
  user_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Fish_Test_Sum_Fields = {
  __typename?: 'fish_test_sum_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['numeric']['output']>;
  downvotes?: Maybe<Scalars['Int']['output']>;
  experience?: Maybe<Scalars['Int']['output']>;
  health?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  max_health?: Maybe<Scalars['Int']['output']>;
  position_row?: Maybe<Scalars['Int']['output']>;
  report_count?: Maybe<Scalars['Int']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Int']['output']>;
  total_losses?: Maybe<Scalars['Int']['output']>;
  total_wins?: Maybe<Scalars['Int']['output']>;
  upvotes?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "fish_test" */
export enum Fish_Test_Update_Column {
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

export type Fish_Test_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Fish_Test_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Fish_Test_Set_Input>;
  /** filter the rows which have to be updated */
  where: Fish_Test_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Fish_Test_Var_Pop_Fields = {
  __typename?: 'fish_test_var_pop_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Fish_Test_Var_Samp_Fields = {
  __typename?: 'fish_test_var_samp_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Fish_Test_Variance_Fields = {
  __typename?: 'fish_test_variance_fields';
  /** 计算后的战斗力 */
  battle_power?: Maybe<Scalars['Float']['output']>;
  downvotes?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['Float']['output']>;
  health?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  max_health?: Maybe<Scalars['Float']['output']>;
  position_row?: Maybe<Scalars['Float']['output']>;
  report_count?: Maybe<Scalars['Float']['output']>;
  /** 天赋值，影响战斗力 */
  talent?: Maybe<Scalars['Float']['output']>;
  total_losses?: Maybe<Scalars['Float']['output']>;
  total_wins?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** update columns of table "fish" */
export enum Fish_Update_Column {
  /** column name */
  Artist = 'artist',
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
  PersonalityType = 'personality_type',
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
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "fish" */
export type Fish_Var_Pop_Order_By = {
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Fish_Var_Samp_Fields = {
  __typename?: 'fish_var_samp_fields';
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "fish" */
export type Fish_Var_Samp_Order_By = {
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Fish_Variance_Fields = {
  __typename?: 'fish_variance_fields';
  report_count?: Maybe<Scalars['Float']['output']>;
  upvotes?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "fish" */
export type Fish_Variance_Order_By = {
  report_count?: InputMaybe<Order_By>;
  upvotes?: InputMaybe<Order_By>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "economy_log" */
  delete_economy_log?: Maybe<Economy_Log_Mutation_Response>;
  /** delete single row from the table: "economy_log" */
  delete_economy_log_by_pk?: Maybe<Economy_Log>;
  /** delete data from the table: "fish" */
  delete_fish?: Maybe<Fish_Mutation_Response>;
  /** delete single row from the table: "fish" */
  delete_fish_by_pk?: Maybe<Fish>;
  /** delete data from the table: "fish_test" */
  delete_fish_test?: Maybe<Fish_Test_Mutation_Response>;
  /** delete single row from the table: "fish_test" */
  delete_fish_test_by_pk?: Maybe<Fish_Test>;
  /** delete data from the table: "reports" */
  delete_reports?: Maybe<Reports_Mutation_Response>;
  /** delete single row from the table: "reports" */
  delete_reports_by_pk?: Maybe<Reports>;
  /** delete data from the table: "user_economy" */
  delete_user_economy?: Maybe<User_Economy_Mutation_Response>;
  /** delete single row from the table: "user_economy" */
  delete_user_economy_by_pk?: Maybe<User_Economy>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** delete data from the table: "votes" */
  delete_votes?: Maybe<Votes_Mutation_Response>;
  /** delete single row from the table: "votes" */
  delete_votes_by_pk?: Maybe<Votes>;
  /** insert data into the table: "economy_log" */
  insert_economy_log?: Maybe<Economy_Log_Mutation_Response>;
  /** insert a single row into the table: "economy_log" */
  insert_economy_log_one?: Maybe<Economy_Log>;
  /** insert data into the table: "fish" */
  insert_fish?: Maybe<Fish_Mutation_Response>;
  /** insert a single row into the table: "fish" */
  insert_fish_one?: Maybe<Fish>;
  /** insert data into the table: "fish_test" */
  insert_fish_test?: Maybe<Fish_Test_Mutation_Response>;
  /** insert a single row into the table: "fish_test" */
  insert_fish_test_one?: Maybe<Fish_Test>;
  /** insert data into the table: "reports" */
  insert_reports?: Maybe<Reports_Mutation_Response>;
  /** insert a single row into the table: "reports" */
  insert_reports_one?: Maybe<Reports>;
  /** insert data into the table: "user_economy" */
  insert_user_economy?: Maybe<User_Economy_Mutation_Response>;
  /** insert a single row into the table: "user_economy" */
  insert_user_economy_one?: Maybe<User_Economy>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** insert data into the table: "votes" */
  insert_votes?: Maybe<Votes_Mutation_Response>;
  /** insert a single row into the table: "votes" */
  insert_votes_one?: Maybe<Votes>;
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
  /** update data of the table: "fish_test" */
  update_fish_test?: Maybe<Fish_Test_Mutation_Response>;
  /** update single row of the table: "fish_test" */
  update_fish_test_by_pk?: Maybe<Fish_Test>;
  /** update multiples rows of table: "fish_test" */
  update_fish_test_many?: Maybe<Array<Maybe<Fish_Test_Mutation_Response>>>;
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
export type Mutation_RootDelete_Fish_TestArgs = {
  where: Fish_Test_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Fish_Test_By_PkArgs = {
  id: Scalars['uuid']['input'];
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
export type Mutation_RootInsert_Fish_TestArgs = {
  objects: Array<Fish_Test_Insert_Input>;
  on_conflict?: InputMaybe<Fish_Test_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Fish_Test_OneArgs = {
  object: Fish_Test_Insert_Input;
  on_conflict?: InputMaybe<Fish_Test_On_Conflict>;
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
export type Mutation_RootUpdate_Fish_TestArgs = {
  _inc?: InputMaybe<Fish_Test_Inc_Input>;
  _set?: InputMaybe<Fish_Test_Set_Input>;
  where: Fish_Test_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Test_By_PkArgs = {
  _inc?: InputMaybe<Fish_Test_Inc_Input>;
  _set?: InputMaybe<Fish_Test_Set_Input>;
  pk_columns: Fish_Test_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Fish_Test_ManyArgs = {
  updates: Array<Fish_Test_Updates>;
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

export type Query_Root = {
  __typename?: 'query_root';
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
  /** fetch data from the table: "fish_test" */
  fish_test: Array<Fish_Test>;
  /** fetch aggregated fields from the table: "fish_test" */
  fish_test_aggregate: Fish_Test_Aggregate;
  /** fetch data from the table: "fish_test" using primary key columns */
  fish_test_by_pk?: Maybe<Fish_Test>;
  /** An array relationship */
  reports: Array<Reports>;
  /** An aggregate relationship */
  reports_aggregate: Reports_Aggregate;
  /** fetch data from the table: "reports" using primary key columns */
  reports_by_pk?: Maybe<Reports>;
  /** fetch data from the table: "user_economy" */
  user_economy: Array<User_Economy>;
  /** fetch aggregated fields from the table: "user_economy" */
  user_economy_aggregate: User_Economy_Aggregate;
  /** fetch data from the table: "user_economy" using primary key columns */
  user_economy_by_pk?: Maybe<User_Economy>;
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


export type Query_RootFish_TestArgs = {
  distinct_on?: InputMaybe<Array<Fish_Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Test_Order_By>>;
  where?: InputMaybe<Fish_Test_Bool_Exp>;
};


export type Query_RootFish_Test_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Test_Order_By>>;
  where?: InputMaybe<Fish_Test_Bool_Exp>;
};


export type Query_RootFish_Test_By_PkArgs = {
  id: Scalars['uuid']['input'];
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
  /** fetch data from the table: "fish_test" */
  fish_test: Array<Fish_Test>;
  /** fetch aggregated fields from the table: "fish_test" */
  fish_test_aggregate: Fish_Test_Aggregate;
  /** fetch data from the table: "fish_test" using primary key columns */
  fish_test_by_pk?: Maybe<Fish_Test>;
  /** fetch data from the table in a streaming manner: "fish_test" */
  fish_test_stream: Array<Fish_Test>;
  /** An array relationship */
  reports: Array<Reports>;
  /** An aggregate relationship */
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


export type Subscription_RootFish_TestArgs = {
  distinct_on?: InputMaybe<Array<Fish_Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Test_Order_By>>;
  where?: InputMaybe<Fish_Test_Bool_Exp>;
};


export type Subscription_RootFish_Test_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Fish_Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Fish_Test_Order_By>>;
  where?: InputMaybe<Fish_Test_Bool_Exp>;
};


export type Subscription_RootFish_Test_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootFish_Test_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Fish_Test_Stream_Cursor_Input>>;
  where?: InputMaybe<Fish_Test_Bool_Exp>;
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

/** columns and relationships of "user_economy" */
export type User_Economy = {
  __typename?: 'user_economy';
  created_at?: Maybe<Scalars['timestamp']['output']>;
  fish_food: Scalars['Int']['output'];
  last_daily_bonus?: Maybe<Scalars['timestamp']['output']>;
  total_earned?: Maybe<Scalars['Int']['output']>;
  total_spent?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  user: Users;
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
  user?: InputMaybe<Users_Bool_Exp>;
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
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
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

/** input type for inserting object relation for remote table "user_economy" */
export type User_Economy_Obj_Rel_Insert_Input = {
  data: User_Economy_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Economy_On_Conflict>;
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
  user?: InputMaybe<Users_Order_By>;
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

/** columns and relationships of "users" */
export type Users = {
  __typename?: 'users';
  avatar_url?: Maybe<Scalars['String']['output']>;
  ban_reason?: Maybe<Scalars['String']['output']>;
  banned_until?: Maybe<Scalars['timestamp']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  economy_logs: Array<Economy_Log>;
  /** An aggregate relationship */
  economy_logs_aggregate: Economy_Log_Aggregate;
  email: Scalars['String']['output'];
  /** An array relationship */
  fishes: Array<Fish>;
  /** An aggregate relationship */
  fishes_aggregate: Fish_Aggregate;
  id: Scalars['String']['output'];
  is_banned?: Maybe<Scalars['Boolean']['output']>;
  last_active?: Maybe<Scalars['timestamp']['output']>;
  /** An array relationship */
  reports: Array<Reports>;
  /** An aggregate relationship */
  reports_aggregate: Reports_Aggregate;
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  /** An object relationship */
  user_economy?: Maybe<User_Economy>;
  user_level?: Maybe<Scalars['Int']['output']>;
  /** An array relationship */
  votes: Array<Votes>;
  /** An aggregate relationship */
  votes_aggregate: Votes_Aggregate;
};


/** columns and relationships of "users" */
export type UsersEconomy_LogsArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersEconomy_Logs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Economy_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Economy_Log_Order_By>>;
  where?: InputMaybe<Economy_Log_Bool_Exp>;
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
  user_level?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  avatar_url?: InputMaybe<String_Comparison_Exp>;
  ban_reason?: InputMaybe<String_Comparison_Exp>;
  banned_until?: InputMaybe<Timestamp_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  display_name?: InputMaybe<String_Comparison_Exp>;
  economy_logs?: InputMaybe<Economy_Log_Bool_Exp>;
  economy_logs_aggregate?: InputMaybe<Economy_Log_Aggregate_Bool_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  fishes?: InputMaybe<Fish_Bool_Exp>;
  fishes_aggregate?: InputMaybe<Fish_Aggregate_Bool_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  is_banned?: InputMaybe<Boolean_Comparison_Exp>;
  last_active?: InputMaybe<Timestamp_Comparison_Exp>;
  reports?: InputMaybe<Reports_Bool_Exp>;
  reports_aggregate?: InputMaybe<Reports_Aggregate_Bool_Exp>;
  reputation_score?: InputMaybe<Int_Comparison_Exp>;
  total_fish_created?: InputMaybe<Int_Comparison_Exp>;
  total_votes_received?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  user_economy?: InputMaybe<User_Economy_Bool_Exp>;
  user_level?: InputMaybe<Int_Comparison_Exp>;
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
  user_level?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  ban_reason?: InputMaybe<Scalars['String']['input']>;
  banned_until?: InputMaybe<Scalars['timestamp']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  display_name?: InputMaybe<Scalars['String']['input']>;
  economy_logs?: InputMaybe<Economy_Log_Arr_Rel_Insert_Input>;
  email?: InputMaybe<Scalars['String']['input']>;
  fishes?: InputMaybe<Fish_Arr_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['String']['input']>;
  is_banned?: InputMaybe<Scalars['Boolean']['input']>;
  last_active?: InputMaybe<Scalars['timestamp']['input']>;
  reports?: InputMaybe<Reports_Arr_Rel_Insert_Input>;
  reputation_score?: InputMaybe<Scalars['Int']['input']>;
  total_fish_created?: InputMaybe<Scalars['Int']['input']>;
  total_votes_received?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  user_economy?: InputMaybe<User_Economy_Obj_Rel_Insert_Input>;
  user_level?: InputMaybe<Scalars['Int']['input']>;
  votes?: InputMaybe<Votes_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  avatar_url?: Maybe<Scalars['String']['output']>;
  ban_reason?: Maybe<Scalars['String']['output']>;
  banned_until?: Maybe<Scalars['timestamp']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  last_active?: Maybe<Scalars['timestamp']['output']>;
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  user_level?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  avatar_url?: Maybe<Scalars['String']['output']>;
  ban_reason?: Maybe<Scalars['String']['output']>;
  banned_until?: Maybe<Scalars['timestamp']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  last_active?: Maybe<Scalars['timestamp']['output']>;
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  user_level?: Maybe<Scalars['Int']['output']>;
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
  avatar_url?: InputMaybe<Order_By>;
  ban_reason?: InputMaybe<Order_By>;
  banned_until?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  display_name?: InputMaybe<Order_By>;
  economy_logs_aggregate?: InputMaybe<Economy_Log_Aggregate_Order_By>;
  email?: InputMaybe<Order_By>;
  fishes_aggregate?: InputMaybe<Fish_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  is_banned?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  reports_aggregate?: InputMaybe<Reports_Aggregate_Order_By>;
  reputation_score?: InputMaybe<Order_By>;
  total_fish_created?: InputMaybe<Order_By>;
  total_votes_received?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_economy?: InputMaybe<User_Economy_Order_By>;
  user_level?: InputMaybe<Order_By>;
  votes_aggregate?: InputMaybe<Votes_Aggregate_Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  BanReason = 'ban_reason',
  /** column name */
  BannedUntil = 'banned_until',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  IsBanned = 'is_banned',
  /** column name */
  LastActive = 'last_active',
  /** column name */
  ReputationScore = 'reputation_score',
  /** column name */
  TotalFishCreated = 'total_fish_created',
  /** column name */
  TotalVotesReceived = 'total_votes_received',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserLevel = 'user_level'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  ban_reason?: InputMaybe<Scalars['String']['input']>;
  banned_until?: InputMaybe<Scalars['timestamp']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  display_name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  is_banned?: InputMaybe<Scalars['Boolean']['input']>;
  last_active?: InputMaybe<Scalars['timestamp']['input']>;
  reputation_score?: InputMaybe<Scalars['Int']['input']>;
  total_fish_created?: InputMaybe<Scalars['Int']['input']>;
  total_votes_received?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  user_level?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  __typename?: 'users_stddev_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
  user_level?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Users_Stddev_Pop_Fields = {
  __typename?: 'users_stddev_pop_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
  user_level?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Users_Stddev_Samp_Fields = {
  __typename?: 'users_stddev_samp_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
  user_level?: Maybe<Scalars['Float']['output']>;
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
  avatar_url?: InputMaybe<Scalars['String']['input']>;
  ban_reason?: InputMaybe<Scalars['String']['input']>;
  banned_until?: InputMaybe<Scalars['timestamp']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  display_name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  is_banned?: InputMaybe<Scalars['Boolean']['input']>;
  last_active?: InputMaybe<Scalars['timestamp']['input']>;
  reputation_score?: InputMaybe<Scalars['Int']['input']>;
  total_fish_created?: InputMaybe<Scalars['Int']['input']>;
  total_votes_received?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  user_level?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  __typename?: 'users_sum_fields';
  reputation_score?: Maybe<Scalars['Int']['output']>;
  total_fish_created?: Maybe<Scalars['Int']['output']>;
  total_votes_received?: Maybe<Scalars['Int']['output']>;
  user_level?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  AvatarUrl = 'avatar_url',
  /** column name */
  BanReason = 'ban_reason',
  /** column name */
  BannedUntil = 'banned_until',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  IsBanned = 'is_banned',
  /** column name */
  LastActive = 'last_active',
  /** column name */
  ReputationScore = 'reputation_score',
  /** column name */
  TotalFishCreated = 'total_fish_created',
  /** column name */
  TotalVotesReceived = 'total_votes_received',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserLevel = 'user_level'
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
  user_level?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Users_Var_Samp_Fields = {
  __typename?: 'users_var_samp_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
  user_level?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Users_Variance_Fields = {
  __typename?: 'users_variance_fields';
  reputation_score?: Maybe<Scalars['Float']['output']>;
  total_fish_created?: Maybe<Scalars['Float']['output']>;
  total_votes_received?: Maybe<Scalars['Float']['output']>;
  user_level?: Maybe<Scalars['Float']['output']>;
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
