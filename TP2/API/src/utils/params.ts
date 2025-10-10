import { FindOptionsOrderValue } from "typeorm";

export function checkDirectionParam(givenDirection: string): FindOptionsOrderValue {
    return givenDirection === 'ASC' || givenDirection === 'DESC' ? givenDirection : 'DESC';
}
