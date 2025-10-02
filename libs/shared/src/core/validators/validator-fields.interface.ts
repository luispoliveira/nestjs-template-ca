export interface FieldsErrors {
  [field: string]: string[];
}

export interface ValidatorFieldsInterface<PropsValidated> {
  errors: FieldsErrors;
  validatedData: PropsValidated;
  validate(props: PropsValidated): boolean;
}
