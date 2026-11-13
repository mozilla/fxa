/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FtlMsg } from 'fxa-react/lib/utils';
import { AttachedClient, useFtlMsgResolver } from '../../../models';
import { ReactComponent as ChevronLegacy } from '../../ResetPasswordWarning/chevron.svg';
import { ReactComponent as ChevronDown } from '../../Icons/nova/chevron-down.min.svg';
import { withNova } from '../../../lib/nova';
import DeviceIcon from '../ConnectedServices/DeviceIcon';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';

/** A device name and every attached client with that name. */
export type SyncDevice = Pick<
  AttachedClient,
  'name' | 'deviceType' | 'isCurrentSession'
> & { clients: AttachedClient[] };

export type FlowDeleteSyncDataDevicesProps = {
  devices: SyncDevice[];
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  onCancel: () => void;
  /** `signOutClients` is empty unless the user checked devices. */
  onConfirm: (signOutClients: AttachedClient[]) => void;
};

const DeviceName = ({
  name,
  isCurrentSession,
  id,
}: SyncDevice & { id: string }) => {
  const deviceName = name || 'unknown';
  return isCurrentSession ? (
    <FtlMsg id="delete-sync-data-this-device" vars={{ deviceName }}>
      <span {...{ id }} className="break-word">
        {`${deviceName} (this device)`}
      </span>
    </FtlMsg>
  ) : (
    <span {...{ id }} className="break-word">
      {deviceName}
    </span>
  );
};

const deviceKey = ({ name }: SyncDevice) => String(name);

const Chevron = withNova(ChevronLegacy, ChevronDown);

const warningTextClassName =
  'text-[var(--color-yellow-60)] dark:text-[var(--color-yellow-20)]';

const rowClassName =
  'flex items-center gap-3 px-4 py-3 border-t first:border-t-0 border-default nova:border-deemphasized';

const checkboxClassName =
  'w-4 h-4 shrink-0 cursor-pointer accent-blue-500 nova:accent-[var(--color-accent-primary)]';

export const FlowDeleteSyncDataDevices = ({
  devices,
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  onCancel,
  onConfirm,
}: FlowDeleteSyncDataDevicesProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const showDevicesLabel = ftlMsgResolver.getMsg(
    'delete-sync-data-show-devices',
    'Show devices'
  );
  const [expanded, setExpanded] = useState(true);
  // Rows are keyed by name, which getSyncDevices makes unique.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = devices.length > 0 && selected.size === devices.length;
  const someSelected = selected.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () =>
    setSelected(new Set(allSelected ? [] : devices.map(deviceKey)));

  const toggleDevice = (device: SyncDevice) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(deviceKey(device))) next.add(deviceKey(device));
      return next;
    });

  return (
    <FlowContainer
      title={localizedPageTitle}
      onBackButtonClick={navigateBackward}
      {...{ localizedBackButtonTitle }}
    >
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(
            devices
              .filter((d) => selected.has(deviceKey(d)))
              .flatMap((d) => d.clients)
          );
        }}
      >
        <ProgressBar currentStep={2} numberOfSteps={2} />

        <FtlMsg id="delete-sync-data-heading">
          <h2 className="font-heading text-xl">Delete synced data?</h2>
        </FtlMsg>

        <FtlMsg id="delete-sync-data-content">
          <p>
            This deletes your synced data from Mozilla’s servers, not your
            devices. If syncing is on, your data will sync back to Mozilla’s
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
                aria-labelledby="delete-sync-data-sign-out-all-label"
                aria-describedby="delete-sync-data-sign-out-all-note"
                data-testid="delete-sync-data-sign-out-all"
              />
              <span className="flex flex-col">
                <FtlMsg id="delete-sync-data-sign-out-all">
                  <span id="delete-sync-data-sign-out-all-label">
                    Sign out of Firefox
                  </span>
                </FtlMsg>
                <FtlMsg id="delete-sync-data-sign-out-all-note">
                  <span
                    id="delete-sync-data-sign-out-all-note"
                    className={warningTextClassName}
                  >
                    Syncing will resume wherever you’re signed in.
                  </span>
                </FtlMsg>
              </span>
            </label>
            <button
              type="button"
              className="p-2 -me-2 rounded focus-visible-default"
              aria-expanded={expanded}
              aria-controls="delete-sync-data-device-list"
              aria-label={showDevicesLabel}
              title={showDevicesLabel}
              onClick={() => setExpanded(!expanded)}
              data-testid="delete-sync-data-expand"
            >
              <Chevron
                className={classNames(
                  'w-3 h-3 shrink-0 transition-transform',
                  expanded && '-rotate-180'
                )}
                aria-hidden
              />
            </button>
          </div>
          {expanded && (
            <ul
              id="delete-sync-data-device-list"
              aria-labelledby="delete-sync-data-sign-out-all-label"
              className="border-t border-default nova:border-deemphasized"
              data-testid="delete-sync-data-device-list"
            >
              {devices.map((device, i) => {
                const checked = selected.has(deviceKey(device));
                const badgeId = `delete-sync-data-badge-${i}`;
                const nameId = `delete-sync-data-device-name-${i}`;
                return (
                  <li
                    key={deviceKey(device)}
                    className={classNames(
                      rowClassName,
                      'ps-4 mobileLandscape:ps-8'
                    )}
                  >
                    <label className="flex flex-1 min-w-0 items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={checked}
                        onChange={() => toggleDevice(device)}
                        aria-labelledby={nameId}
                        aria-describedby={badgeId}
                        data-testid="delete-sync-data-sign-out-device"
                      />
                      <span
                        className="mono-icon flex shrink-0 text-default"
                        aria-hidden
                      >
                        <DeviceIcon
                          name={device.name}
                          deviceType={device.deviceType}
                          className="w-5 h-4"
                        />
                      </span>
                      {/* On phones the badge drops under the name so the name gets the row's width. */}
                      <span className="flex flex-1 min-w-0 flex-col items-start gap-1 mobileLandscape:flex-row mobileLandscape:items-center mobileLandscape:justify-between mobileLandscape:gap-3">
                        <DeviceName {...device} id={nameId} />
                        {/* Both labels share one grid cell so the badge keeps the wider label's width. */}
                        <span
                          className={classNames(
                            'grid shrink-0 justify-items-center rounded-full px-2 py-0.5 text-xs font-bold',
                            checked
                              ? 'bg-grey-50 text-grey-500 dark:bg-grey-600 dark:text-grey-100'
                              : classNames('bg-warning', warningTextClassName)
                          )}
                        >
                          <FtlMsg id="delete-sync-data-sign-out-badge">
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
                          <FtlMsg id="delete-sync-data-stay-signed-in-badge">
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
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-2">
          <FtlMsg id="delete-sync-data-cancel">
            <button
              type="button"
              className="cta-neutral cta-base-p"
              onClick={onCancel}
            >
              Cancel
            </button>
          </FtlMsg>
          <FtlMsg
            id={
              selected.size > 0
                ? 'delete-sync-data-delete-and-sign-out'
                : 'delete-sync-data-delete'
            }
          >
            <button
              type="submit"
              className="cta-caution cta-base-p"
              data-testid="delete-sync-data-confirm"
            >
              {selected.size > 0 ? 'Delete and sign out' : 'Delete'}
            </button>
          </FtlMsg>
        </div>
      </form>
    </FlowContainer>
  );
};

export default FlowDeleteSyncDataDevices;
