import { scoreToRingClass } from '@/lib/scores';

interface Props {
  score: number;
  size?: number;
  fontSize?: number;
}

export default function ScoreRing({ score, size = 38, fontSize = 13 }: Props) {
  const cls = scoreToRingClass(score);
  return (
    <div className={cls} style={{
      width: size, height: size, borderRadius: '50%',
      display: 'grid', placeItems: 'center',
      fontFamily: 'monospace', fontWeight: 700, fontSize,
      flexShrink: 0,
    }}>
      {score}
    </div>
  );
}