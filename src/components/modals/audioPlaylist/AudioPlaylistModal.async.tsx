import type { OwnProps } from './AudioPlaylistModal';

import { Bundles } from '../../../util/moduleLoader';

import useModuleLoader from '../../../hooks/useModuleLoader';

const AudioPlaylistModalAsync = (props: OwnProps) => {
  const { modal } = props;
  const AudioPlaylistModal = useModuleLoader(Bundles.Extra, 'AudioPlaylistModal', !modal);

  return AudioPlaylistModal ? <AudioPlaylistModal {...props} /> : undefined;
};

export default AudioPlaylistModalAsync;
