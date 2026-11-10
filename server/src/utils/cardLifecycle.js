import { randomBytes } from 'node:crypto';

export const createCardNumber = (organization) => `${organization?.code || 'ORG'}-${randomBytes(4).toString('hex').toUpperCase()}`;

export const createExpiryDate = (organization, from = new Date()) => {
  const date = new Date(from);
  date.setMonth(date.getMonth() + Math.min(120, Math.max(1, Number(organization?.validityMonths) || 12)));
  return date;
};

export const formatValidity = (date) => date.toLocaleDateString('en', { month: 'long', year: 'numeric' });

export const isCardExpired = (card, now = new Date()) => {
  const expiry = card?.expiresAt || (card?.validUntil ? new Date(card.validUntil) : null);
  return Boolean(expiry && !Number.isNaN(expiry.getTime()) && expiry < now);
};
