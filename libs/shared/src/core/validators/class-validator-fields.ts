/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { validateSync } from 'class-validator';
import { FieldsErrors, ValidatorFieldsInterface } from './validator-fields.interface';

export abstract class ClassValidatorFields<PropsValidated>
  implements ValidatorFieldsInterface<PropsValidated>
{
  errors: FieldsErrors = {};
  validatedData: PropsValidated = {} as PropsValidated;
  validate(props: PropsValidated): boolean {
    const errors = validateSync(props as object);
    if (errors.length) {
      this.errors = {};
      for (const error of errors) {
        const field = error.property;
        this.errors[field] = Object.values(error.constraints ?? {});
      }
    } else {
      this.validatedData = props;
    }

    return !errors.length;
  }
}
