interface UserDetailsModel {
  id: number;
  roleId: number;
  role: string;
  displayName: string;
  password?: string;
  email: string;
  countryCode?: string;
  contactNumber: string;
  userSkills?: SkillsModel[];
  active: boolean;
  lock: boolean;
  token?: string;
  homeDistrict?: string;
  homePostalCode?: string;
  new?: boolean;
}
