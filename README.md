# biring

A shared household expense ledger for Android. One household logs expenses into a single list; writes are stored on the device first and synced to Supabase later.

Private and pre-release. Installed directly from an EAS APK, not the Play Store. Android only — there is no iOS or web build.

## Stack

- Expo SDK 57 / React Native 0.86 / Expo Router
- NativeWind 4, Public Sans
- Supabase: auth, Postgres, RLS, RPCs
- PowerSync + op-sqlite: local database and background sync

## Features

- Email/password accounts.
- Create a household or join with an invite code or QR scan.
- Dashboard with month navigation, previous-month comparison, top categories, and recent expenses.
- Expense entry: amount, free-text category, date (no future dates), title, optional note.
- Members add and edit their own expenses; owners can edit or void any expense.
- Expenses are never deleted. Voided rows stay out of every total and are kept in history.
- Summary by category and by member for the selected month.
- Settings: members, own nickname, kick, role change, invite share and rotation, archive, leave, dark mode, sign out.
- CSV export of every expense in the household, including voided rows: save to a chosen folder or share.

## Offline

Works offline: all reads, add/edit/void an expense, edit own nickname. Changes queue locally and upload later; if the server rejects one, the row reverts.

Needs a connection: register, sign in, create, join, leave, kick, change a role, regenerate the invite code, archive, sign out. Those buttons are disabled while disconnected.

The first sync after login needs a connection, because the device has no data yet.

## Screenshots<img width="1080" height="2340" alt="Screenshot_20261031_114617_biring" src="https://github.com/user-attachments/assets/c19ee9e3-5e88-4084-9914-3f7fe252daf0" />
<img width="1080" height="2340" alt="Screenshot_20261031_114619_biring" src="https://github.com/user-attachments/assets/7b888457-c4e9-4af4-a499-be8b3fb43bb0" />
<img width="1080" height="2340" alt="Screenshot_20261031_114614_biring" src="https://github.com/user-attachments/assets/c65eac97-498d-4e47-b7cf-8f27319088c3" />
<img width="1080" height="2340" alt="Screenshot_20261031_114531_biring" src="https://github.com/user-attachments/assets/29aa1609-0668-4b2d-9da8-c2930e059f52" />
<img width="1080" height="2340" alt="Screenshot_20261031_114537_biring" src="https://github.com/user-attachments/assets/a8937b76-eac5-4939-b673-621a4114fd20" />
<img width="1080" height="2340" alt="Screenshot_20261031_114541_biring" src="https://github.com/user-attachments/assets/04c38ccb-d85c-44ad-9bf3-d30fb5124ac1" />
<img width="1080" height="2340" alt="Screenshot_20261031_114548_biring" src="https://github.com/user-attachments/assets/e6e1479b-47e3-4a70-bb30-a85e7c4be9b2" />
<img width="1080" height="2340" alt="Screenshot_20261031_114559_biring" src="https://github.com/user-attachments/assets/859f81ec-5d61-4e96-9973-a875855708be" />
<img width="1080" height="2340" alt="Screenshot_20261031_114603_biring" src="https://github.com/user-attachments/assets/15fb1301-90c7-48d7-8d21-20e8688f5b51" />
<img width="1080" height="2340" alt="Screenshot_20261031_114606_biring" src="https://github.com/user-attachments/assets/1a766dd3-c806-40f9-a86f-def74fd2b206" />
<img width="1080" height="2340" alt="Screenshot_20261031_114611_biring" src="https://github.com/user-attachments/assets/257b81d0-f6d9-48d4-a100-7eb84f96b982" />
<img width="1080" height="2340" alt="Screenshot_20261031_114622_biring" src="https://github.com/user-attachments/assets/5af3b9ab-e19a-4e5b-929d-104b0f249085" />
