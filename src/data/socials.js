// Profile identification verified on Instagram on 2026-10-05.
export const officialSocials = { instagram: 'https://www.instagram.com/filhasdejorj/' };
export const bethelFacebook = 'https://www.facebook.com/Bethel001rj/';
export function socialContact(contact = {}) {
  return { ...contact, instagram: contact.instagram || officialSocials.instagram, facebook: contact.facebook || bethelFacebook, facebook_label: contact.facebook ? 'Facebook' : 'Facebook do Bethel #001 Rio de Janeiro' };
}
