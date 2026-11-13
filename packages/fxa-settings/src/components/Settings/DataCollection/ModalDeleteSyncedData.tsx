/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FtlMsg } from 'fxa-react/lib/utils';
import Modal from '../Modal';
import Banner from '../../Banner';
import { AttachedClient, useFtlMsgResolver } from '../../../models';
import { ReactComponent as DesktopIcon } from '../ConnectedServices/desktop.svg';
import { ReactComponent as MobileIcon } from '../ConnectedServices/mobile.svg';
import { ReactComponent as TabletIcon } from '../ConnectedServices/tablet.svg';
import { ReactComponent as Chevron } from '../../ResetPasswordWarning/chevron.svg';

export type SyncDevice = Pick<
  AttachedClient,
  'name' | 'deviceType' | 'isCurrentSession'
> & { deviceId: string };

// ponytail: two variants for design review; delete the one Design doesn't pick.
export type ModalDeleteSyncedDataVariant = 'warning' | 'signOut';

export type ModalDeleteSyncedDataProps = {
  devices: SyncDevice[];
  variant: ModalDeleteSyncedDataVariant;
  onDismiss: () => void;
  /** `signOutDeviceIds` is empty unless the `signOut` variant has devices checked. */
  onConfirm: (signOutDeviceIds: string[]) => void;
};

const DeviceIcon = ({ name, deviceType }: SyncDevice) => {
  const className = 'w-5 h-4 shrink-0 text-default';
  if ((name || '').toLowerCase().includes('ipad') || deviceType === 'tablet') {
    return <TabletIcon {...{ className }} aria-hidden />;
  }
  if (deviceType === 'mobile') {
    return <MobileIcon {...{ className }} aria-hidden />;
  }
  return <DesktopIcon {...{ className }} aria-hidden />;
};

const DeviceName = ({ name, isCurrentSession }: SyncDevice) =>
  isCurrentSession ? (
    <FtlMsg id="dc-synced-data-this-device" vars={{ deviceName: name || '' }}>
      <span className="break-word">{`${name} (this device)`}</span>
    </FtlMsg>
  ) : (
    <span className="break-word">{name}</span>
  );

const rowClassName =
  'flex items-center gap-3 px-4 py-3 border-t first:border-t-0 border-default nova:border-deemphasized';

const checkboxClassName =
  'w-4 h-4 shrink-0 cursor-pointer accent-blue-500 nova:accent-[var(--color-accent-primary)]';

export const ModalDeleteSyncedData = ({
  devices,
  variant,
  onDismiss,
  onConfirm,
}: ModalDeleteSyncedDataProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = devices.length > 0 && selectedIds.size === devices.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () =>
    setSelectedIds(
      allSelected ? new Set() : new Set(devices.map((d) => d.deviceId))
    );

  const toggleDevice = (deviceId: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(deviceId)) next.add(deviceId);
      return next;
    });

  const signOutSelected = variant === 'signOut' && selectedIds.size > 0;

  return (
    <Modal
      onDismiss={onDismiss}
      hasButtons={false}
      headerId="delete-synced-data-header"
      descId="delete-synced-data-desc"
      data-testid="modal-delete-synced-data"
    >
      <FtlMsg id="dc-synced-data-modal-heading">
        <h2
          id="delete-synced-data-header"
          className="font-heading text-xl mb-2 -mt-2"
        >
          Delete synced data?
        </h2>
      </FtlMsg>

      {variant === 'warning' ? (
        <>
          <FtlMsg id="dc-synced-data-modal-content">
            <p id="delete-synced-data-desc" className="mb-4">
              This deletes your synced data from Mozilla’s servers, not your
              devices. If syncing is on, your data may return to Mozilla’s
              servers.
            </p>
          </FtlMsg>
          <Banner
            type="warning"
            content={{
              localizedDescription: ftlMsgResolver.getMsg(
                'dc-synced-data-modal-may-be-syncing',
                `${devices.length} devices may be syncing. To stop syncing, sign out or go to Settings > Account and sync in Firefox, and disconnect sync.`,
                { count: devices.length }
              ),
            }}
          />
          <ul
            className="mt-4 border rounded-lg border-default nova:border-deemphasized nova:rounded-xl text-sm"
            data-testid="synced-data-device-list"
          >
            {devices.map((device) => (
              <li key={device.deviceId} className={rowClassName}>
                <DeviceIcon {...device} />
                <DeviceName {...device} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <FtlMsg id="dc-synced-data-modal-content-sign-out">
            <p id="delete-synced-data-desc" className="mb-4">
              This deletes your synced data from Mozilla’s servers, not your
              devices. If syncing is on, your data may return to Mozilla’s
              servers. Sign out to stop syncing data.
            </p>
          </FtlMsg>
          <div className="border rounded-lg border-default nova:border-deemphasized nova:rounded-xl text-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <label className="flex flex-1 items-center gap-3 cursor-pointer">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className={checkboxClassName}
                  checked={allSelected}
                  onChange={toggleAll}
                  data-testid="synced-data-sign-out-all"
                />
                <FtlMsg
                  id="dc-synced-data-sign-out-all"
                  vars={{ count: devices.length }}
                >
                  <span id="synced-data-sign-out-all-label">{`Sign out of Firefox on all my devices (${devices.length})`}</span>
                </FtlMsg>
              </label>
              <button
                type="button"
                className="p-2 -me-2 rounded focus-visible-default"
                aria-expanded={expanded}
                aria-controls="synced-data-device-list"
                title={ftlMsgResolver.getMsg(
                  'dc-synced-data-show-devices',
                  'Show devices'
                )}
                onClick={() => setExpanded(!expanded)}
                data-testid="synced-data-expand"
              >
                <Chevron
                  className={classNames(
                    'w-3 h-2 transition-transform [&_path]:fill-current',
                    expanded && '-rotate-180'
                  )}
                  aria-hidden
                />
              </button>
            </div>
            {expanded && (
              <ul
                id="synced-data-device-list"
                aria-labelledby="synced-data-sign-out-all-label"
                className="border-t border-default nova:border-deemphasized bg-canvas"
                data-testid="synced-data-device-list"
              >
                {devices.map((device) => {
                  const checked = selectedIds.has(device.deviceId);
                  const badgeId = `synced-data-badge-${device.deviceId}`;
                  return (
                    <li
                      key={device.deviceId}
                      className={classNames(rowClassName, 'ps-8')}
                    >
                      <label className="flex flex-1 min-w-0 items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className={checkboxClassName}
                          checked={checked}
                          onChange={() => toggleDevice(device.deviceId)}
                          aria-describedby={badgeId}
                          data-testid="synced-data-sign-out-device"
                        />
                        <DeviceIcon {...device} />
                        <DeviceName {...device} />
                      </label>
                      {/* Both labels share one grid cell so the badge keeps the wider label's width. */}
                      <span className="grid shrink-0 justify-items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-grey-50 dark:bg-grey-600 nova:bg-deemphasized">
                        <FtlMsg id="dc-synced-data-sign-out-badge">
                          <span
                            id={checked ? badgeId : undefined}
                            aria-hidden={!checked}
                            className={classNames(
                              'col-start-1 row-start-1',
                              !checked && 'invisible'
                            )}
                          >
                            Sign out
                          </span>
                        </FtlMsg>
                        <FtlMsg id="dc-synced-data-stay-signed-in-badge">
                          <span
                            id={checked ? undefined : badgeId}
                            aria-hidden={checked}
                            className={classNames(
                              'col-start-1 row-start-1',
                              checked && 'invisible'
                            )}
                          >
                            Stay signed in
                          </span>
                        </FtlMsg>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      <div className="flex flex-wrap justify-end gap-3 mt-6">
        <FtlMsg id="dc-synced-data-modal-cancel">
          <button
            type="button"
            className="cta-neutral cta-base-p"
            onClick={onDismiss}
          >
            Cancel
          </button>
        </FtlMsg>
        {signOutSelected ? (
          <FtlMsg id="dc-synced-data-modal-delete-and-sign-out">
            <button
              type="button"
              className="cta-caution cta-base-p"
              onClick={() => onConfirm(Array.from(selectedIds))}
              data-testid="synced-data-confirm"
            >
              Delete and sign out
            </button>
          </FtlMsg>
        ) : (
          <FtlMsg id="dc-synced-data-modal-delete">
            <button
              type="button"
              className="cta-caution cta-base-p"
              onClick={() => onConfirm([])}
              data-testid="synced-data-confirm"
            >
              Delete
            </button>
          </FtlMsg>
        )}
      </div>
    </Modal>
  );
};

export default ModalDeleteSyncedData;
