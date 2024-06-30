getwd()
setwd("C:/Users/athar/Desktop/ZER01")
passes <-read.csv("passes1.csv")
passes

midpts<-barplot(passes$Stat,ylab="Total passes",col=rainbow(50),main="Stats for passes",cex.names = 0.8,las = 2,ylim = c(0, 1000))

grid(nx = NA, ny = NULL, lwd = 1, lty = 1, col = "gray")

text(passes$Player,
     x = midpts,
     offset = -0.1,
     y = -20,
     cex = 0.8,
     srt = 40,
     xpd = TRUE,
     pos = 2 )

w <-read.csv("passes_wins.csv")
w
# Data generation
set.seed(1)
x <- w$Passes
y <- w$Wins

# Creating the plot
plot(x, y, pch = 19, col = "lightblue")

# Regression line
abline(lm(y ~ x), col = "red", lwd = 3)

# Pearson correlation
text(paste("Correlation:", round(cor(x, y), 2)), x = 17000, y = 25)

w <-read.csv("assists1.csv")
w
w <-read.csv("assists_wins.csv")
w
plot(w$Assists,
     w$Goals,
     main="Comparing goals and passes",
     xlab="Assists",
     ylab="Goals",
     pch=19,
     cex=w$Wins/9,
     cex.axis=1.5,
     col=rainbow(10))

color.function <- colorRampPalette( c( "#CCCCCC" , "#104E8B" ) )
pal <- colorRampPalette(colors = c("lightblue", "blue"))(3)
with(foo, barplot(mpg, 
                  names.arg = cyl, 
                  xlab = "Number of cylinders", 
                  ylab = "Mean miles per gallon", 
                  col = pal))

#goalsconceded
df<-read.csv("C:\\Users\\aayus\\Documents\\pl_20-21.csv")
library(dplyr)
defenders<-subset(df,Position=="Defender")
defenders<-defenders%>%
        arrange(desc(Appearances)) 
defenders<- head(defenders,10)
defenders["cpg"]<-defenders$Goals.Conceded/defenders$Appearances
plot(defenders$Clean.sheets,defenders$cpg,ylab='Goals conceded per game',cex=defenders$Tackles/50, main ='Goals conceded per game vs Clean sheets',xlab="Clean Sheets",col="#b77ff0",pch=20)

x <- c(94, 62, 10, 53)
names <- c("Apple", "Samsung", "Nokia", "Motorola")
pie(x,names)



#Pie chart with colors
colour<-c("Red","Blue","Green","Yellow")
pie(x,names,col=colour,main="Revenue generated in USD")



pie(x,names,col=rainbow(length(x)),main="Revenue generated in USD")




#pie chart with percentage and legend
piepercent<- round(100*x/sum(x), 1)



pie(x, labels = piepercent, main = "Revenue generated in USD",col = rainbow(length(x)))



legend("topright", legend = names, cex = 0.8,fill = rainbow(length(x)))





w <-read.csv("assists_wins.csv")
plot(w$Assists,
     w$Goals,
     main="Comparing Goals and Assists",
     xlab="Assists",
     ylab="Goals",
     pch=19,
     cex=w$Wins/9,
     cex.axis=1.5,
     col=rainbow(10))
legend("bottomright", legend =w$Club, cex = 0.6,fill = rainbow(10))
library(plotly)
w <-read.csv("assists_wins.csv")
d <- w[sample(nrow(w), 10), ]


fig <- plot_ly(
        d, x = ~Assists, y = ~Goals,
        # Hover text:
        text = ~paste("Team: ", Club, '<br>Assists:', Assists,'<br>Wins:', Wins),
        color = ~Assists, size = ~Wins
)

fig
