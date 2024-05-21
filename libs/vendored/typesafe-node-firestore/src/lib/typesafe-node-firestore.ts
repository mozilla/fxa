import * as firestore from '@google-cloud/firestore';

export interface TypedDocumentData<T extends firestore.DocumentData>
  extends firestore.DocumentData {
  [field: string]: T;
}

export interface TypedDocumentChange<T extends firestore.DocumentData>
  extends firestore.DocumentChange {
  readonly doc: TypedQueryDocumentSnapshot<T>;

  isEqual(other: TypedDocumentChange<T>): boolean;
}

export interface TypedDocumentReference<T extends firestore.DocumentData>
  extends firestore.DocumentReference {
  readonly parent: TypedCollectionReference<T>;
  readonly path: string;

  collection(collectionPath: string): TypedCollectionReference<T>;

  create(data: T): Promise<firestore.WriteResult>;

  isEqual(other: TypedDocumentReference<T>): boolean;

  set(data: T, options?: firestore.SetOptions): Promise<firestore.WriteResult>;

  update(
    data: Partial<T>,
    precondition?: firestore.Precondition
  ): Promise<firestore.WriteResult>;

  update(
    field: keyof T | firestore.FieldPath,
    value: T[keyof T],
    ...moreFieldsAndValues: T[keyof T][]
  ): Promise<firestore.WriteResult>;

  delete(precondition?: firestore.Precondition): Promise<firestore.WriteResult>;

  get(): Promise<TypedDocumentSnapshot<T>>;

  onSnapshot(
    onNext: (snapshot: TypedDocumentSnapshot<T>) => void,
    onError?: (error: Error) => void
  ): () => void;
}

export interface TypedDocumentSnapshot<T extends firestore.DocumentData>
  extends firestore.DocumentSnapshot {
  readonly ref: TypedDocumentReference<T>;
  data(options?: firestore.QuerySnapshot): T | undefined;
}

export interface TypedQuery<T extends TypedDocumentData<T>>
  extends firestore.Query {
  where(
    fieldPath: keyof T | firestore.FieldPath,
    opStr: firestore.WhereFilterOp,
    value: T[keyof T]
  ): TypedQuery<T>;

  where(filter: firestore.Filter): TypedQuery<T>;

  orderBy(
    fieldPath: keyof T | firestore.FieldPath,
    directionStr?: firestore.OrderByDirection
  ): TypedQuery<T>;

  limit(limit: number): TypedQuery<T>;

  offset(offset: number): TypedQuery<T>;

  select(...field: (keyof T | firestore.FieldPath)[]): TypedQuery<T>;

  startAt(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  startAt(...fieldValues: T[keyof T][]): TypedQuery<T>;

  startAfter(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  startAfter(...fieldValues: T[keyof T][]): TypedQuery<T>;

  endBefore(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  endBefore(...fieldValues: T[keyof T][]): TypedQuery<T>;

  endAt(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  endAt(...fieldValues: T[keyof T][]): TypedQuery<T>;

  get(): Promise<TypedQuerySnapshot<T>>;

  isEqual(other: TypedQuery<T>): boolean;
}

export interface TypedQueryDocumentSnapshot<T extends firestore.DocumentData>
  extends firestore.QueryDocumentSnapshot {
  readonly ref: TypedDocumentReference<T>;
  data(): T;
}

export interface TypedQuerySnapshot<T extends firestore.DocumentData>
  extends firestore.QuerySnapshot {
  readonly docs: TypedQueryDocumentSnapshot<T>[];

  docChanges(): TypedDocumentChange<T>[];

  forEach(
    callback: (result: TypedQueryDocumentSnapshot<T>) => void,
    thisArg?: any
  ): void;

  isEqual(other: TypedQuerySnapshot<T>): boolean;
}

export interface TypedCollectionReference<T extends firestore.DocumentData>
  extends firestore.CollectionReference {
  listDocuments(): Promise<TypedDocumentReference<T>[]>;

  doc(): TypedDocumentReference<T>;

  doc(documentPath?: string): TypedDocumentReference<T>;

  add(data: T): Promise<TypedDocumentReference<T>>;

  isEqual(other: TypedCollectionReference<T>): boolean;

  // extends Query overrides with TypedQuery
  where(
    fieldPath: keyof T | firestore.FieldPath,
    opStr: firestore.WhereFilterOp,
    value: T[keyof T]
  ): TypedQuery<T>;

  where(filter: firestore.Filter): TypedQuery<T>;

  orderBy(
    fieldPath: keyof T | firestore.FieldPath,
    directionStr?: firestore.OrderByDirection
  ): TypedQuery<T>;

  limit(limit: number): TypedQuery<T>;

  offset(offset: number): TypedQuery<T>;

  select(...field: (keyof T | firestore.FieldPath)[]): TypedQuery<T>;

  startAt(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  startAt(...fieldValues: T[keyof T][]): TypedQuery<T>;

  startAfter(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  startAfter(...fieldValues: T[keyof T][]): TypedQuery<T>;

  endBefore(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  endBefore(...fieldValues: T[keyof T][]): TypedQuery<T>;

  endAt(snapshot: TypedDocumentSnapshot<T>): TypedQuery<T>;

  endAt(...fieldValues: T[keyof T][]): TypedQuery<T>;

  get(): Promise<TypedQuerySnapshot<T>>;

  onSnapshot(
    onNext: (snapshot: TypedQuerySnapshot<T>) => void,
    onError?: (error: Error) => void
  ): () => void;
}
