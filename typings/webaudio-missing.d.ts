
interface MediaStream {
    id: string;
    active: boolean;
}

interface MediaStreamAudioSourceNode extends AudioNode {

}

interface MediaStreamAudioDestinationNode extends AudioNode {
    stream: MediaStream;
}

interface AudioContext {
    state: string;
    close: () => void;
    createMediaStreamSource: () => MediaStreamAudioSourceNode;
    createMediaStreamDestination: () => any;
    resume: () => void;
    suspend: () => void;
}

interface Window {
  webkitAudioContext: AudioContext;
}
