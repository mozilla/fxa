/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import CmsButtonWithFallback from '.';

export default {
  title: 'components/CmsButtonWithFallback',
  component: CmsButtonWithFallback,
} as Meta;

// Gradient comparison view

export const GradientComparison = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
    }}
  >
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
      Gradient Button Examples
    </h2>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
        Dark Gradients (White Text)
      </h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #592ACB 0%, #350080 100%)"
          buttonText="Dark Purple"
          type="button"
        />
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #592ACB 0%, #350080 100%)"
          buttonText="Disabled"
          type="button"
          disabled
        />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
        Light Gradients (Dark Text)
      </h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #FFD700 0%, #FFA500 100%)"
          buttonText="Gold Orange"
          type="button"
        />
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #FFD700 0%, #FFA500 100%)"
          buttonText="Disabled"
          type="button"
          disabled
        />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
        Very Light Gradients (Dark Text)
      </h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #FFFFCC 0%, #FFFFE0 100%)"
          buttonText="Very Light"
          type="button"
        />
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #FFFFCC 0%, #FFFFE0 100%)"
          buttonText="Disabled"
          type="button"
          disabled
        />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
        Multi-Color Gradients
      </h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #FF4F5E 0%, #592ACB 50%, #00D4FF 100%)"
          buttonText="Rainbow"
          type="button"
        />
        <CmsButtonWithFallback
          buttonColor="linear-gradient(90deg, #FF4F5E 0%, #592ACB 50%, #00D4FF 100%)"
          buttonText="Disabled"
          type="button"
          disabled
        />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Radial Gradients</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback
          buttonColor="radial-gradient(circle, #592ACB 0%, #350080 100%)"
          buttonText="Radial Dark"
          type="button"
        />
        <CmsButtonWithFallback
          buttonColor="radial-gradient(circle, #592ACB 0%, #350080 100%)"
          buttonText="Disabled"
          type="button"
          disabled
        />
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
        Solid Colors (for comparison)
      </h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback
          buttonColor="#592ACB"
          buttonText="Solid Dark"
          type="button"
        />
        <CmsButtonWithFallback
          buttonColor="#592ACB"
          buttonText="Disabled"
          type="button"
          disabled
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback
          buttonColor="#FFD700"
          buttonText="Solid Light"
          type="button"
        />
        <CmsButtonWithFallback
          buttonColor="#FFD700"
          buttonText="Disabled"
          type="button"
          disabled
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <CmsButtonWithFallback buttonText="Default (No CMS)" type="button" />
        <CmsButtonWithFallback buttonText="Disabled" type="button" disabled />
      </div>
    </div>
  </div>
);
