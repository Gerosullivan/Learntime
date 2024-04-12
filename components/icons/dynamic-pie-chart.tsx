import { FC } from "react"

interface ChatbotUISVGProps {
  value: number
  scale?: number
}

const DynamicPieChart: FC<ChatbotUISVGProps> = ({ value, scale = 1 }) => {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const filledPercentage = value === 0 ? 50 : value
  const dashOffset = ((100 - filledPercentage) / 100) * circumference

  const linked = value > 50
  const hasRecalled = value >= 0

  const strokeColor = linked ? "ForestGreen" : "coral" // Set stroke color based on value

  return (
    <svg width={50 * scale} height={50 * scale} viewBox="0 0 50 50">
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke="#ccc"
        strokeWidth="10"
        transform="rotate(-90 25 25)"
      />
      {hasRecalled && (
        <g>
          <circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke={strokeColor} // Use strokeColor
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 25 25)"
          />
          <circle
            cx="25"
            cy="25"
            r="16"
            fill={strokeColor}
            transform="rotate(-90 25 25)"
          />
          <g transform="translate(7,43) scale(0.006,-0.006)" fill="#fff">
            {linked ? (
              <path
                d="M2790 5794 c-136 -12 -350 -49 -483 -83 -361 -92 -691 -251 -996
  -478 -153 -114 -430 -391 -544 -544 -286 -383 -464 -811 -538 -1290 -33 -208
  -33 -590 0 -798 74 -479 252 -907 538 -1290 114 -153 391 -430 544 -544 383
  -286 811 -464 1290 -538 208 -33 590 -33 798 0 479 74 907 252 1290 538 153
  114 430 391 544 544 286 383 464 811 538 1290 33 208 33 590 0 798 -74 479
  -252 907 -538 1290 -114 153 -391 430 -544 544 -382 285 -816 466 -1285 537
  -134 20 -496 34 -614 24z m1305 -1008 c348 -104 605 -368 696 -716 74 -286 13
  -606 -161 -839 -69 -93 -662 -679 -735 -726 -201 -131 -439 -191 -658 -167
  -125 14 -198 33 -300 77 -121 52 -181 92 -288 193 -142 135 -175 212 -129 303
  34 65 109 99 187 84 30 -5 56 -26 128 -99 97 -99 170 -148 287 -192 67 -25 85
  -28 213 -28 121 -1 149 2 205 22 143 51 185 85 510 411 328 329 349 356 403
  508 28 80 31 99 31 208 0 103 -4 132 -27 201 -131 396 -594 578 -957 376 -47
  -26 -116 -85 -248 -214 -226 -222 -268 -244 -369 -198 -78 35 -112 131 -75
  211 22 50 327 356 426 429 71 52 188 111 276 140 122 41 187 49 345 46 127 -3
  164 -7 240 -30z m-1309 -1126 c107 -14 183 -34 277 -75 121 -52 181 -92 288
  -193 142 -135 175 -212 129 -303 -34 -65 -109 -99 -187 -84 -30 5 -56 26 -128
  99 -97 99 -170 148 -287 192 -67 25 -85 28 -213 28 -121 1 -149 -2 -205 -22
  -143 -51 -185 -85 -510 -411 -328 -329 -349 -356 -403 -508 -28 -80 -31 -99
  -31 -208 0 -103 4 -132 27 -201 131 -396 593 -578 957 -376 48 26 115 85 252
  219 186 183 227 213 288 213 105 0 187 -109 160 -212 -10 -37 -39 -71 -193
  -224 -197 -196 -259 -246 -376 -305 -166 -84 -313 -114 -508 -106 -254 10
  -478 110 -659 293 -340 346 -382 908 -94 1293 69 93 662 679 735 726 91 59
  183 102 281 130 152 43 259 53 400 35z"
              />
            ) : (
              <path
                d="M2790 5794 c-136 -12 -350 -49 -483 -83 -361 -92 -691 -251 -996
  -478 -153 -114 -430 -391 -544 -544 -286 -383 -464 -811 -538 -1290 -33 -208
  -33 -590 0 -798 74 -479 252 -907 538 -1290 114 -153 391 -430 544 -544 383
  -286 811 -464 1290 -538 208 -33 590 -33 798 0 479 74 907 252 1290 538 153
  114 430 391 544 544 286 383 464 811 538 1290 33 208 33 590 0 798 -74 479
  -252 907 -538 1290 -114 153 -391 430 -544 544 -382 285 -816 466 -1285 537
  -134 20 -496 34 -614 24z m-369 -987 c19 -12 44 -42 57 -67 21 -43 22 -53 22
  -330 0 -276 -1 -286 -23 -325 -30 -55 -95 -88 -160 -82 -51 4 -88 26 -121 71
  -20 26 -21 42 -24 335 -3 306 -3 307 20 341 54 80 156 106 229 57z m1653 -16
  c355 -96 610 -351 718 -716 20 -71 23 -99 22 -260 0 -167 -2 -186 -28 -270
  -62 -204 -145 -327 -377 -558 -178 -178 -219 -204 -297 -192 -91 14 -156 116
  -132 207 10 34 44 75 193 228 196 201 232 250 280 387 28 79 31 100 31 203 1
  195 -57 336 -193 470 -83 82 -169 133 -286 170 -108 34 -272 32 -380 -4 -132
  -45 -177 -78 -373 -269 -227 -221 -268 -243 -369 -197 -78 35 -112 131 -75
  211 22 50 327 356 425 428 111 81 259 145 412 177 94 20 331 12 429 -15z
  m-2153 -984 c41 -27 79 -98 79 -147 0 -54 -38 -111 -90 -138 -44 -22 -50 -23
  -342 -20 -282 3 -298 4 -324 24 -49 36 -67 70 -72 131 -3 49 0 64 20 93 13 19
  39 45 57 57 33 23 38 23 336 23 297 0 303 0 336 -23z m-10 -607 c72 -20 126
  -109 114 -189 -6 -42 -20 -58 -193 -236 -202 -206 -237 -254 -285 -392 -28
  -79 -31 -100 -31 -203 -1 -195 57 -336 193 -470 83 -82 169 -133 286 -170 108
  -34 272 -32 380 4 134 46 177 77 377 273 186 183 227 213 288 213 105 0 187
  -109 160 -212 -10 -37 -39 -71 -193 -224 -197 -196 -259 -246 -376 -305 -164
  -82 -312 -114 -499 -106 -442 17 -793 299 -924 742 -20 71 -23 99 -22 260 0
  167 2 186 28 270 34 113 92 229 156 314 27 36 127 144 223 239 200 199 229
  217 318 192z m2845 -726 c49 -36 67 -70 72 -131 3 -49 0 -64 -20 -93 -13 -19
  -39 -45 -57 -57 -33 -23 -38 -23 -336 -23 -297 0 -303 0 -336 23 -41 27 -79
  98 -79 147 0 54 38 111 90 138 44 22 50 23 342 20 282 -3 298 -4 324 -24z
  m-998 -501 c14 -10 35 -32 46 -47 20 -26 21 -42 24 -335 3 -306 3 -307 -20
  -341 -37 -54 -83 -80 -143 -80 -66 0 -112 29 -142 90 -22 43 -23 53 -23 330 0
  276 1 286 23 325 44 79 167 109 235 58z"
              />
            )}
          </g>
        </g>
      )}
    </svg>
  )
}

export default DynamicPieChart
