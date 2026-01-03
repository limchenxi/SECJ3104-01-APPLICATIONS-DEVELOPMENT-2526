import { useState } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack,
} from "@mui/material";
import type { Flashcard } from "../../type";

interface FlashcardPreviewProps {
  flashcards: Flashcard[];
}
// interface SingleFlashcardProps {
//   card: Flashcard;
//   index: number;
// }

function SingleFlashcard({ card, index }: { card: Flashcard; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        minHeight: 120, 
        cursor: 'pointer', 
        p: 2, 
        transition: 'transform 0.5s',
      }}
      onClick={handleFlip}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="caption" color="text.secondary" mb={1}>
          Kad Imbas #{index + 1}
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            align="center"
          >
            {isFlipped ? card.back : card.front} 
          </Typography>
        </Box>
        <Typography variant="caption" align="right" color="primary">
            Klik untuk {isFlipped ? 'tutup' : 'jawab'}
        </Typography>
      </CardContent>
    </Card>
  );
}


export default function FlashcardPreview({ flashcards }: FlashcardPreviewProps) {
  if (!flashcards || flashcards.length === 0) {
    return (
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Tiada kad imbas dijana.
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle1" fontWeight="bold">
        Total {flashcards.length} Kad Imbas Dijana
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
        {flashcards.map((card, index) => (
          <SingleFlashcard 
            key={index} 
            card={card} 
            index={index}
          />
        ))}
      </Box>
    </Stack>
  );
}