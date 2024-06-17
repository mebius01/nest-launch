import { ETables } from "../../../services/database/enums";
import { DBMapper } from "../../../services/database/mapper";
import { INIT_DATA } from "../data";

export const seed = async (mapper: DBMapper) => {
  await mapper.create(ETables.Users, INIT_DATA.users);
}